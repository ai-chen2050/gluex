import { FC, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useNetworkConfiguration } from '../contexts/NetworkConfigurationProvider';

const NetworkSwitcher: FC = () => {
  const { networkConfiguration, setNetworkConfiguration } = useNetworkConfiguration();
  const [isLocalhost, setIsLocalhost] = useState(false);

  useEffect(() => {
    // Check if running on localhost:3000
    if (typeof window !== 'undefined') {
      setIsLocalhost(window.location.hostname === 'localhost' && window.location.port === '3000');
    }
  }, []);

  console.log(networkConfiguration);

  return (
    <label className="cursor-pointer label">
      <a>Network</a>
      <select             
        value={networkConfiguration}
        onChange={(e) => setNetworkConfiguration(e.target.value)} 
        className="select max-w-xs"
      >
        {isLocalhost && <option value="localnet">local</option>}
        <option value="mainnet-beta">main</option>
        <option value="devnet">dev</option>
        <option value="testnet">test</option>
      </select>
    </label>
  );
};

export default dynamic(() => Promise.resolve(NetworkSwitcher), {
  ssr: false
})