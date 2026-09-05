import React from 'react';
import { PromptBuilder } from '../PromptBuilder';
import { PromptOptimizer } from '../PromptOptimizer';

interface Props {
  type: 'builder' | 'optimizer';
}

export const BuilderOptimizerView: React.FC<Props> = ({ type }) => {
  return (
    <div className="max-w-7xl mx-auto py-6 animate-fade-in">
      {type === 'builder' ? <PromptBuilder /> : <PromptOptimizer />}
    </div>
  );
};

