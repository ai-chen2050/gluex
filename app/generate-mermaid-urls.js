const mermaid1 = `%%{init: {
  'theme': 'dark',
  'themeVariables': {
    'darkMode': true,
    'background': '#0A3D62',
    'primaryColor': '#6366f1',
    'primaryTextColor': '#ffffff',
    'primaryBorderColor': '#a855f7',
    'lineColor': '#a855f7',
    'secondaryColor': '#312e81',
    'tertiaryColor': '#701a75',
    'nodeBorder': '#a855f7',
    'fontFamily': 'monospace',
    'fontSize': '16px'
  }
}}%%
graph TD
    A[Issuer] --> B[GoalVault]
    B --> C[Taker]
    C --> D[Proof]
    D --> E[Verifier]
    E -->|Release| B
    
    style A fill:#6366f1,stroke:#a855f7,stroke-width:2px,color:#ffffff
    style B fill:#6366f1,stroke:#a855f7,stroke-width:2px,color:#ffffff
    style C fill:#312e81,stroke:#a855f7,stroke-width:2px,color:#ffffff
    style D fill:#312e81,stroke:#a855f7,stroke-width:2px,color:#ffffff
    style E fill:#701a75,stroke:#a855f7,stroke-width:2px,color:#ffffff`;

const mermaid2 = `%%{init: {
  'theme': 'dark',
  'themeVariables': {
    'darkMode': true,
    'background': '#0A3D62',
    'primaryColor': '#6366f1',
    'primaryTextColor': '#ffffff',
    'primaryBorderColor': '#a855f7',
    'lineColor': '#a855f7',
    'secondaryColor': '#312e81',
    'tertiaryColor': '#701a75',
    'nodeBorder': '#a855f7',
    'fontFamily': 'monospace',
    'fontSize': '16px'
  }
}}%%
graph TD
    A[User] --> B[RoleSpace]
    B --> C[Habit]
    B --> D[Targets]
    B --> E[Surprise]
    C --> F[Verifier]
    D --> F[Verifier]
    E --> G[Vault]
    
    style A fill:#6366f1,stroke:#a855f7,stroke-width:2px,color:#ffffff
    style B fill:#6366f1,stroke:#a855f7,stroke-width:2px,color:#ffffff
    style C fill:#312e81,stroke:#a855f7,stroke-width:2px,color:#ffffff
    style D fill:#312e81,stroke:#a855f7,stroke-width:2px,color:#ffffff
    style E fill:#312e81,stroke:#a855f7,stroke-width:2px,color:#ffffff
    style F fill:#701a75,stroke:#a855f7,stroke-width:2px,color:#ffffff
    style G fill:#701a75,stroke:#a855f7,stroke-width:2px,color:#ffffff`;

const config1 = {
  code: mermaid1,
  mermaid: {
    theme: 'dark',
    themeVariables: {
      darkMode: true,
      background: '#000000',
      primaryColor: '#6366f1',
      primaryTextColor: '#ffffff',
      primaryBorderColor: '#a855f7',
      lineColor: '#a855f7',
      secondaryColor: '#312e81',
      tertiaryColor: '#701a75',
      nodeBorder: '#a855f7',
      fontFamily: 'monospace',
      fontSize: '16px'
    }
  }
};

const config2 = {
  code: mermaid2,
  mermaid: {
    theme: 'dark',
    themeVariables: {
      darkMode: true,
      background: '#000000',
      primaryColor: '#6366f1',
      primaryTextColor: '#ffffff',
      primaryBorderColor: '#a855f7',
      lineColor: '#a855f7',
      secondaryColor: '#312e81',
      tertiaryColor: '#701a75',
      nodeBorder: '#a855f7',
      fontFamily: 'monospace',
      fontSize: '16px'
    }
  }
};

const url1 = 'https://mermaid.ink/img/' + Buffer.from(JSON.stringify(config1)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '') + "?theme=dark&bgColor=000000";
const url2 = 'https://mermaid.ink/img/' + Buffer.from(JSON.stringify(config2)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '') + "?theme=dark&bgColor=000000";

console.log('URL 1:', url1);
console.log('URL 2:', url2);

