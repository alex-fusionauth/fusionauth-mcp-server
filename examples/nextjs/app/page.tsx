'use client';

import { useState } from 'react';

export default function Home() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ queryString: '*' }),
      });
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>FusionAuth MCP Next.js Example</h1>
      <p>This example demonstrates how to use FusionAuth MCP tools in a Next.js application.</p>
      
      <div style={{ marginTop: '2rem' }}>
        <button 
          onClick={searchUsers} 
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Loading...' : 'Search Users'}
        </button>
      </div>

      {users.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Users ({users.length})</h2>
          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            {users.map((user: any) => (
              <div 
                key={user.id} 
                style={{
                  padding: '1rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: '#f9f9f9'
                }}
              >
                <h3>{user.firstName} {user.lastName}</h3>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Username:</strong> {user.username || 'N/A'}</p>
                <p><strong>ID:</strong> {user.id}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}