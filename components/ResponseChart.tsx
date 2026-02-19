
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Question, PlayerAnswer } from '../types';

interface ResponseChartProps {
  question: Question;
  answers: PlayerAnswer[];
  showCorrect: boolean;
}

const ResponseChart: React.FC<ResponseChartProps> = ({ question, answers, showCorrect }) => {
  const data = question.options.map((option, index) => ({
    name: option,
    count: answers.filter(a => a.optionIndex === index).length,
    isCorrect: index === question.correctIndex,
  }));

  return (
    <div className="w-full h-64 mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={showCorrect ? (entry.isCorrect ? '#22c55e' : '#f43f5e') : '#6366f1'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ResponseChart;
