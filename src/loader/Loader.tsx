import './loader.css';

export default function Loader() {
  return (
    <div className="loader-overlay">
      <div className="loader-box">
<img
  src="https://i.gifer.com/ZZ5H.gif"
  alt="Loading"
  style={{ width: '64px', height: '64px' }}
/>


        <p>Waiting for wallet confirmation...</p>
      </div>
    </div>
  );
}
