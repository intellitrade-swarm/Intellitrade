
/**
 * Agent Governance & Staking System
 * Blockchain-verified agent IDs with built-in rules, on-chain voting, and performance staking
 */

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// ============================================
// TYPES & INTERFACES
// ============================================

export interface BlockchainIDConfig {
  agentId: string;
  chain: 'ethereum' | 'base' | 'polygon';
  spendingCap: number;
  dailySpendingCap: number;
  allowedStrategies: string[];
  requiresApproval?: boolean;
  socialRecovery?: boolean;
  recoveryAddresses?: string[];
}

export interface GovernanceProposalCreate {
  title: string;
  description: string;
  proposalType: 'STRATEGY_UPDATE' | 'SPENDING_CAP' | 'AGENT_PARAMETER' | 'EMERGENCY_STOP';
  targetAgentId?: string;
  affectsAllAgents?: boolean;
  proposedChanges: any;
  currentValues?: any;
  votingDuration: number; // Hours
  proposer: string;
}

export interface VoteSubmission {
  proposalId: string;
  voterAddress: string;
  voterId: string;
  vote: 'FOR' | 'AGAINST' | 'ABSTAIN';
  reason?: string;
}

export interface StakeSubmission {
  userId: string;
  userAddress: string;
  agentId: string;
  amount: number;
  lockPeriod?: number; // Days
}

// ============================================
// BLOCKCHAIN ID MANAGEMENT
// ============================================

/**
 * Mint a blockchain-verified ID for an agent
 */
export async function mintAgentBlockchainID(config: BlockchainIDConfig) {
  try {
    // Check if agent already has a blockchain ID
    const existing = await prisma.agentBlockchainID.findUnique({
      where: { agentId: config.agentId }
    });

    if (existing) {
      throw new Error(`Agent ${config.agentId} already has a blockchain ID`);
    }

    // Generate mock contract address and token ID
    // In production, this would interact with actual smart contracts
    const contractAddress = `0x${crypto.randomBytes(20).toString('hex')}`;
    const tokenId = Math.floor(Math.random() * 1000000);
    const mintTxHash = `0x${crypto.randomBytes(32).toString('hex')}`;

    // Create blockchain ID
    const blockchainID = await prisma.agentBlockchainID.create({
      data: {
        agentId: config.agentId,
        contractAddress,
        tokenId,
        chain: config.chain,
        mintTxHash,
        spendingCap: config.spendingCap,
        dailySpendingCap: config.dailySpendingCap,
        allowedStrategies: config.allowedStrategies,
        requiresApproval: config.requiresApproval || false,
        socialRecovery: config.socialRecovery || false,
        recoveryAddresses: config.recoveryAddresses || [],
        verified: true,
        totalTrades: 0,
        totalVolume: 0
      }
    });

    // Create initial audit log entry
    await createAuditLogEntry({
      agentId: config.agentId,
      actionType: 'BLOCKCHAIN_ID_MINTED',
      actionData: {
        contractAddress,
        tokenId,
        chain: config.chain,
        spendingCap: config.spendingCap
      },
      newState: blockchainID,
      triggeredBy: 'SYSTEM'
    });

    return blockchainID;
  } catch (error) {
    console.error('Error minting blockchain ID:', error);
    throw error;
  }
}

/**
 * Get blockchain ID for an agent
 */
export async function getAgentBlockchainID(agentId: string) {
  return await prisma.agentBlockchainID.findUnique({
    where: { agentId },
    include: {
      agent: {
        select: {
          name: true,
          strategyType: true,
          totalProfitLoss: true,
          winRate: true
        }
      }
    }
  });
}

/**
 * Update spending cap via governance or admin
 */
export async function updateSpendingCap(agentId: string, newCap: number, triggeredBy: string) {
  const blockchainID = await prisma.agentBlockchainID.findUnique({
    where: { agentId }
  });

  if (!blockchainID) {
    throw new Error('Agent does not have a blockchain ID');
  }

  const previousState = { spendingCap: blockchainID.spendingCap };

  const updated = await prisma.agentBlockchainID.update({
    where: { agentId },
    data: { spendingCap: newCap }
  });

  await createAuditLogEntry({
    agentId,
    actionType: 'PARAMETER_CHANGE',
    actionData: {
      parameter: 'spendingCap',
      oldValue: previousState.spendingCap,
      newValue: newCap
    },
    previousState,
    newState: { spendingCap: newCap },
    triggeredBy
  });

  return updated;
}

// ============================================
// GOVERNANCE PROPOSALS
// ============================================

/**
 * Create a new governance proposal
 */
export async function createGovernanceProposal(data: GovernanceProposalCreate) {
  try {
    const votingEndTime = new Date();
    votingEndTime.setHours(votingEndTime.getHours() + data.votingDuration);

    const proposal = await prisma.governanceProposal.create({
      data: {
        title: data.title,
        description: data.description,
        proposalType: data.proposalType,
        targetAgentId: data.targetAgentId,
        affectsAllAgents: data.affectsAllAgents || false,
        proposedChanges: data.proposedChanges,
        currentValues: data.currentValues,
        votingEndTime,
        proposer: data.proposer,
        status: 'ACTIVE'
      }
    });

    // Create audit log if targeting specific agent
    if (data.targetAgentId) {
      await createAuditLogEntry({
        agentId: data.targetAgentId,
        actionType: 'GOVERNANCE_ACTION',
        actionData: {
          action: 'PROPOSAL_CREATED',
          proposalId: proposal.id,
          title: data.title
        },
        newState: proposal,
        triggeredBy: data.proposer,
        governanceProposalId: proposal.id
      });
    }

    return proposal;
  } catch (error) {
    console.error('Error creating governance proposal:', error);
    throw error;
  }
}

/**
 * Submit a vote on a governance proposal
 */
export async function submitVote(vote: VoteSubmission) {
  try {
    // Get the proposal
    const proposal = await prisma.governanceProposal.findUnique({
      where: { id: vote.proposalId }
    });

    if (!proposal) {
      throw new Error('Proposal not found');
    }

    if (proposal.status !== 'ACTIVE') {
      throw new Error('Proposal is not active');
    }

    if (new Date() > proposal.votingEndTime) {
      throw new Error('Voting period has ended');
    }

    // Get voter's staked amount (voting power)
    const stakes = await prisma.agentStaking.findMany({
      where: {
        userId: vote.voterId,
        active: true
      }
    });

    const totalStaked = stakes.reduce((sum, stake) => sum + stake.stakedAmount, 0);

    if (totalStaked === 0) {
      throw new Error('Must have staked tokens to vote');
    }

    // Create or update vote
    const submittedVote = await prisma.governanceVote.upsert({
      where: {
        proposalId_voterAddress: {
          proposalId: vote.proposalId,
          voterAddress: vote.voterAddress
        }
      },
      create: {
        proposalId: vote.proposalId,
        voterAddress: vote.voterAddress,
        voterId: vote.voterId,
        vote: vote.vote,
        votingPower: totalStaked,
        stakedAmount: totalStaked,
        reason: vote.reason
      },
      update: {
        vote: vote.vote,
        votingPower: totalStaked,
        stakedAmount: totalStaked,
        reason: vote.reason
      }
    });

    // Update proposal vote counts
    await updateProposalVoteCounts(vote.proposalId);

    return submittedVote;
  } catch (error) {
    console.error('Error submitting vote:', error);
    throw error;
  }
}

/**
 * Update proposal vote counts and check if passed
 */
async function updateProposalVoteCounts(proposalId: string) {
  const votes = await prisma.governanceVote.findMany({
    where: { proposalId }
  });

  let votesFor = 0;
  let votesAgainst = 0;

  votes.forEach(vote => {
    if (vote.vote === 'FOR') votesFor += vote.votingPower;
    if (vote.vote === 'AGAINST') votesAgainst += vote.votingPower;
  });

  const totalVotes = votes.length;

  // Get total staked amount across all agents
  const allStakes = await prisma.agentStaking.findMany({
    where: { active: true }
  });
  const totalStaked = allStakes.reduce((sum, stake) => sum + stake.stakedAmount, 0);

  const proposal = await prisma.governanceProposal.findUnique({
    where: { id: proposalId }
  });

  if (!proposal) return;

  const quorumReached = totalStaked > 0 && (votesFor + votesAgainst) >= (totalStaked * proposal.quorumRequired / 100);
  const passed = quorumReached && votesFor > (votesFor + votesAgainst) * proposal.passThreshold / 100;

  await prisma.governanceProposal.update({
    where: { id: proposalId },
    data: {
      votesFor,
      votesAgainst,
      totalVotes,
      quorumReached,
      passed,
      status: passed ? 'PASSED' : (new Date() > proposal.votingEndTime ? 'REJECTED' : 'ACTIVE')
    }
  });
}

/**
 * Get all active proposals
 */
export async function getActiveProposals() {
  return await prisma.governanceProposal.findMany({
    where: {
      status: 'ACTIVE',
      votingEndTime: {
        gte: new Date()
      }
    },
    include: {
      targetAgent: {
        select: {
          name: true,
          strategyType: true
        }
      },
      votes: {
        select: {
          vote: true,
          votingPower: true,
          createdAt: true
        }
      }
    },
    orderBy: {
      votingEndTime: 'asc'
    }
  });
}

/**
 * Execute a passed proposal
 */
export async function executeProposal(proposalId: string) {
  const proposal = await prisma.governanceProposal.findUnique({
    where: { id: proposalId }
  });

  if (!proposal) {
    throw new Error('Proposal not found');
  }

  if (!proposal.passed) {
    throw new Error('Proposal has not passed');
  }

  if (proposal.executed) {
    throw new Error('Proposal already executed');
  }

  // Execute the proposal based on type
  let executionTxHash = `0x${crypto.randomBytes(32).toString('hex')}`;

  if (proposal.proposalType === 'SPENDING_CAP' && proposal.targetAgentId && proposal.proposedChanges) {
    const changes = proposal.proposedChanges as any;
    const newCap = changes.spendingCap;
    if (typeof newCap === 'number') {
      await updateSpendingCap(proposal.targetAgentId, newCap, `GOVERNANCE:${proposalId}`);
    }
  }

  // Mark as executed
  await prisma.governanceProposal.update({
    where: { id: proposalId },
    data: {
      executed: true,
      executionTxHash,
      status: 'EXECUTED'
    }
  });

  return { success: true, txHash: executionTxHash };
}

// ============================================
// STAKING SYSTEM
// ============================================

/**
 * Stake tokens on an agent
 */
export async function stakeOnAgent(stake: StakeSubmission) {
  try {
    // Get agent details
    const agent = await prisma.aIAgent.findUnique({
      where: { id: stake.agentId }
    });

    if (!agent) {
      throw new Error('Agent not found');
    }

    // Calculate lock period
    const lockedUntil = stake.lockPeriod ? 
      new Date(Date.now() + stake.lockPeriod * 24 * 60 * 60 * 1000) : 
      null;

    // Create staking record
    const staking = await prisma.agentStaking.create({
      data: {
        userId: stake.userId,
        userAddress: stake.userAddress,
        agentId: stake.agentId,
        stakedAmount: stake.amount,
        lockedUntil,
        agentPnLAtStake: agent.totalProfitLoss,
        agentWinRateAtStake: agent.winRate,
        active: true
      }
    });

    return staking;
  } catch (error) {
    console.error('Error staking on agent:', error);
    throw error;
  }
}

/**
 * Unstake tokens from an agent
 */
export async function unstakeFromAgent(userId: string, agentId: string) {
  const staking = await prisma.agentStaking.findUnique({
    where: {
      userId_agentId: {
        userId,
        agentId
      }
    }
  });

  if (!staking) {
    throw new Error('No active stake found');
  }

  if (staking.lockedUntil && new Date() < staking.lockedUntil) {
    throw new Error('Stake is still locked');
  }

  // Calculate final rewards
  await calculateAndDistributeRewards(staking.id);

  // Mark as inactive
  await prisma.agentStaking.update({
    where: { id: staking.id },
    data: { active: false }
  });

  return { success: true, stakedAmount: staking.stakedAmount, rewards: staking.unclaimedRewards };
}

/**
 * Calculate and distribute staking rewards
 */
export async function calculateAndDistributeRewards(stakingId: string) {
  const staking = await prisma.agentStaking.findUnique({
    where: { id: stakingId },
    include: {
      agent: true
    }
  });

  if (!staking) return;

  // Calculate staking duration in days
  const stakingDuration = Math.floor((Date.now() - staking.stakedAt.getTime()) / (24 * 60 * 60 * 1000));

  if (stakingDuration === 0) return; // No rewards for less than a day

  // Calculate agent's performance improvement
  const pnlImprovement = staking.agent.totalProfitLoss - staking.agentPnLAtStake;
  const winRateImprovement = staking.agent.winRate - staking.agentWinRateAtStake;

  // Calculate reward based on performance
  // Base APY: 10%, Bonus for positive performance
  let rewardRate = 10; // Base APY

  if (pnlImprovement > 0) {
    rewardRate += Math.min(pnlImprovement * 0.01, 20); // Up to 20% bonus
  }

  if (winRateImprovement > 0) {
    rewardRate += Math.min(winRateImprovement * 10, 10); // Up to 10% bonus
  }

  // Calculate reward amount
  const rewardAmount = (staking.stakedAmount * rewardRate / 100 / 365) * stakingDuration;

  // Create reward record
  await prisma.stakingReward.create({
    data: {
      stakingId: staking.id,
      amount: rewardAmount,
      rewardType: 'PERFORMANCE',
      agentId: staking.agentId,
      agentPerformance: staking.agent.winRate,
      stakingDuration,
      rewardRate,
      calculationData: {
        pnlImprovement,
        winRateImprovement,
        baseAPY: 10,
        bonusAPY: rewardRate - 10
      }
    }
  });

  // Update staking record
  await prisma.agentStaking.update({
    where: { id: stakingId },
    data: {
      totalRewardsEarned: {
        increment: rewardAmount
      },
      unclaimedRewards: {
        increment: rewardAmount
      }
    }
  });

  return rewardAmount;
}

/**
 * Claim staking rewards
 */
export async function claimStakingRewards(stakingId: string) {
  const staking = await prisma.agentStaking.findUnique({
    where: { id: stakingId },
    include: {
      rewards: {
        where: { claimed: false }
      }
    }
  });

  if (!staking) {
    throw new Error('Staking record not found');
  }

  const totalUnclaimed = staking.rewards.reduce((sum, r) => sum + r.amount, 0);

  if (totalUnclaimed === 0) {
    throw new Error('No unclaimed rewards');
  }

  // Mark all rewards as claimed
  await prisma.stakingReward.updateMany({
    where: {
      stakingId,
      claimed: false
    },
    data: {
      claimed: true,
      claimedAt: new Date(),
      claimTxHash: `0x${crypto.randomBytes(32).toString('hex')}`
    }
  });

  // Update staking record
  await prisma.agentStaking.update({
    where: { id: stakingId },
    data: {
      unclaimedRewards: 0,
      lastRewardClaim: new Date()
    }
  });

  return { success: true, amount: totalUnclaimed };
}

/**
 * Get staking statistics for an agent
 */
export async function getAgentStakingStats(agentId: string) {
  const stakes = await prisma.agentStaking.findMany({
    where: {
      agentId,
      active: true
    }
  });

  const totalStaked = stakes.reduce((sum, stake) => sum + stake.stakedAmount, 0);
  const uniqueStakers = new Set(stakes.map(s => s.userId)).size;
  
  const allRewards = await prisma.stakingReward.findMany({
    where: { agentId }
  });
  
  const totalRewardsDistributed = allRewards.reduce((sum, r) => sum + r.amount, 0);

  return {
    totalStaked,
    uniqueStakers,
    totalRewardsDistributed,
    averageStake: stakes.length > 0 ? totalStaked / stakes.length : 0
  };
}

// ============================================
// AUDIT TRAIL
// ============================================

/**
 * Create an audit log entry
 */
export async function createAuditLogEntry(data: {
  agentId: string;
  actionType: string;
  actionData: any;
  previousState?: any;
  newState?: any;
  triggeredBy?: string;
  governanceProposalId?: string;
  amountSpent?: number;
  txHash?: string;
}) {
  try {
    // Get previous audit log for chaining
    const previousAudit = await prisma.agentAuditLog.findFirst({
      where: { agentId: data.agentId },
      orderBy: { createdAt: 'desc' }
    });

    // Generate audit hash
    const auditData = {
      agentId: data.agentId,
      actionType: data.actionType,
      actionData: data.actionData,
      timestamp: new Date().toISOString()
    };
    const auditHash = crypto.createHash('sha256').update(JSON.stringify(auditData)).digest('hex');

    // Get blockchain ID for spending tracking
    let cumulativeDailySpend: number | undefined;
    let withinSpendingCap = true;

    if (data.amountSpent) {
      const blockchainID = await prisma.agentBlockchainID.findUnique({
        where: { agentId: data.agentId }
      });

      if (blockchainID) {
        // Calculate daily spend
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todaysLogs = await prisma.agentAuditLog.findMany({
          where: {
            agentId: data.agentId,
            createdAt: { gte: today },
            amountSpent: { not: null }
          }
        });

        cumulativeDailySpend = todaysLogs.reduce((sum, log) => sum + (log.amountSpent || 0), 0) + data.amountSpent;
        withinSpendingCap = data.amountSpent <= blockchainID.spendingCap && 
                           cumulativeDailySpend <= blockchainID.dailySpendingCap;
      }
    }

    // Create audit log
    const auditLog = await prisma.agentAuditLog.create({
      data: {
        agentId: data.agentId,
        actionType: data.actionType,
        actionData: data.actionData,
        previousState: data.previousState,
        newState: data.newState,
        txHash: data.txHash,
        auditHash,
        previousAuditHash: previousAudit?.auditHash,
        triggeredBy: data.triggeredBy,
        governanceProposalId: data.governanceProposalId,
        amountSpent: data.amountSpent,
        cumulativeDailySpend,
        withinSpendingCap,
        verified: true
      }
    });

    return auditLog;
  } catch (error) {
    console.error('Error creating audit log:', error);
    throw error;
  }
}

/**
 * Get audit trail for an agent
 */
export async function getAgentAuditTrail(agentId: string, limit: number = 100) {
  return await prisma.agentAuditLog.findMany({
    where: { agentId },
    orderBy: { createdAt: 'desc' },
    take: limit
  });
}

/**
 * Verify audit trail integrity
 */
export async function verifyAuditTrailIntegrity(agentId: string): Promise<{ valid: boolean; errors: string[] }> {
  const logs = await prisma.agentAuditLog.findMany({
    where: { agentId },
    orderBy: { createdAt: 'asc' }
  });

  const errors: string[] = [];

  for (let i = 1; i < logs.length; i++) {
    if (logs[i].previousAuditHash !== logs[i - 1].auditHash) {
      errors.push(`Audit chain broken at log ${logs[i].id}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Export a singleton instance
export const agentGovernance = {
  mintAgentBlockchainID,
  getAgentBlockchainID,
  updateSpendingCap,
  createGovernanceProposal,
  submitVote,
  getActiveProposals,
  executeProposal,
  stakeOnAgent,
  unstakeFromAgent,
  calculateAndDistributeRewards,
  claimStakingRewards,
  getAgentStakingStats,
  createAuditLogEntry,
  getAgentAuditTrail,
  verifyAuditTrailIntegrity
};
