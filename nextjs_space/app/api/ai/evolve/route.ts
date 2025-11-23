
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/db';
import { generateEvolutionStrategy } from '../../../../lib/openai';

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all active agents sorted by performance
    const agents = await prisma.aIAgent.findMany({
      where: { isActive: true },
      orderBy: { totalProfitLoss: 'desc' }
    });

    if (agents.length < 3) {
      return NextResponse.json({ error: 'Need at least 3 agents for evolution' }, { status: 400 });
    }

    // Split into top and bottom performers
    const midpoint = Math.ceil(agents.length / 2);
    const topAgents = agents.slice(0, midpoint).map(a => ({
      name: a.name,
      strategyType: a.strategyType,
      parameters: a.parameters,
      totalProfitLoss: a.totalProfitLoss,
      sharpeRatio: a.sharpeRatio,
      winRate: a.winRate
    }));

    const bottomAgents = agents.slice(midpoint).map(a => ({
      name: a.name,
      strategyType: a.strategyType,
      parameters: a.parameters,
      totalProfitLoss: a.totalProfitLoss,
      sharpeRatio: a.sharpeRatio,
      winRate: a.winRate
    }));

    // Get AI evolution strategy
    const evolutionStrategy = await generateEvolutionStrategy(topAgents, bottomAgents);

    // Apply mutations
    const mutationResults = [];
    for (const mutation of evolutionStrategy.mutations || []) {
      const agent = agents.find(a => a.name === mutation.agentName);
      if (agent) {
        const updatedParameters = {
          ...(typeof agent.parameters === 'object' ? agent.parameters : {}),
          ...(mutation.parameterChanges || {})
        };

        await prisma.aIAgent.update({
          where: { id: agent.id },
          data: {
            parameters: updatedParameters,
            mutationCount: { increment: 1 }
          }
        });

        // Record evolution event
        await prisma.evolutionEvent.create({
          data: {
            type: 'MUTATION',
            targetAgentId: agent.id,
            parentAgentIds: [],
            parameters: updatedParameters,
            fitness: agent.sharpeRatio,
            generation: agent.generation,
            description: mutation.reasoning || 'AI-driven parameter mutation'
          }
        });

        mutationResults.push({
          agentName: agent.name,
          changes: mutation.parameterChanges,
          reasoning: mutation.reasoning
        });
      }
    }

    // Apply crossovers (breeding)
    const crossoverResults = [];
    for (const crossover of evolutionStrategy.crossovers || []) {
      const parent1 = agents.find(a => a.name === crossover.parent1);
      const parent2 = agents.find(a => a.name === crossover.parent2);
      
      if (parent1 && parent2) {
        // Find a bottom performer to replace
        const weakestAgent = agents[agents.length - 1];
        
        if (weakestAgent) {
          // Blend parameters from both parents
          const parent1Params = typeof parent1.parameters === 'object' && parent1.parameters !== null && !Array.isArray(parent1.parameters) ? parent1.parameters as Record<string, any> : {};
          const parent2Params = typeof parent2.parameters === 'object' && parent2.parameters !== null && !Array.isArray(parent2.parameters) ? parent2.parameters as Record<string, any> : {};
          
          const newParameters: Record<string, any> = {
            ...parent1Params
          };
          
          // Randomly inherit some traits from parent2
          if (parent2Params) {
            Object.keys(parent2Params).forEach(key => {
              if (Math.random() > 0.5) {
                newParameters[key] = parent2Params[key];
              }
            });
          }

          await prisma.aIAgent.update({
            where: { id: weakestAgent.id },
            data: {
              strategyType: Math.random() > 0.5 ? parent1.strategyType : parent2.strategyType,
              parameters: newParameters,
              parentIds: [parent1.id, parent2.id],
              generation: Math.max(parent1.generation, parent2.generation) + 1,
              // Reset performance metrics
              currentBalance: 10000,
              totalTrades: 0,
              winRate: 0,
              totalProfitLoss: 0,
              sharpeRatio: 0
            }
          });

          // Record evolution event
          await prisma.evolutionEvent.create({
            data: {
              type: 'BREEDING',
              targetAgentId: weakestAgent.id,
              parentAgentIds: [parent1.id, parent2.id],
              parameters: newParameters,
              generation: Math.max(parent1.generation, parent2.generation) + 1,
              description: `Bred from ${parent1.name} and ${parent2.name}: ${crossover.inheritedTraits || 'New hybrid strategy'}`
            }
          });

          crossoverResults.push({
            newAgent: weakestAgent.name,
            parents: [parent1.name, parent2.name],
            traits: crossover.inheritedTraits,
            reasoning: crossover.reasoning
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      mutations: mutationResults,
      crossovers: crossoverResults,
      insights: evolutionStrategy.insights,
      message: `Evolution complete: ${mutationResults.length} mutations, ${crossoverResults.length} crossovers`
    });

  } catch (error) {
    console.error('Error in AI evolution:', error);
    return NextResponse.json(
      { error: 'Failed to execute AI evolution', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
