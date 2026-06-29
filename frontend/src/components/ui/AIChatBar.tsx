import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';

const AIChatBar: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    

    // Mock API call
    setTimeout(() => {
      setResponse("Based on your prompt, here is a summary of the traffic trends: We noticed a 15% increase in unique visitors compared to the previous week, largely driven by social media referrals.");
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-color)' }}>
        <Sparkles size={20} />
        <h3 style={{ fontWeight: 600 }}>Ask AI Assistant</h3>
      </div>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px' }}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 'Summarize my traffic trends from last week'"
          style={{ 
            flex: 1, 
            padding: '12px 16px', 
            borderRadius: '8px', 
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(0,0,0,0.2)',
            color: 'white',
            outline: 'none'
          }}
        />
        <button 
          type="submit" 
          disabled={isLoading}
          style={{ 
            padding: '12px 24px', 
            borderRadius: '8px',
            background: 'var(--accent-color)',
            color: 'white',
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600
          }}
        >
          {isLoading ? 'Processing...' : 'Ask'}
          <Send size={16} />
        </button>
      </form>

      {response && (
        <div className="animate-fade-in" style={{ 
          marginTop: '8px', 
          padding: '16px', 
          background: 'rgba(59, 130, 246, 0.1)', 
          borderLeft: '4px solid var(--accent-color)',
          borderRadius: '4px',
          color: 'var(--text-primary)',
          lineHeight: '1.6'
        }}>
          {response}
        </div>
      )}
    </div>
  );
};

export default AIChatBar;

