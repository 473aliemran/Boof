import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const tg = window.Telegram?.WebApp;
const STORAGE = "boof-demo-v1";

const defaultState = {
  coins: 0,
  energy: 500,
  maxEnergy: 500,
  power: 1,
  level: 1,
  incomePerHour: 0,
  lastClaim: 0,
  lastEnergyTick: Date.now(),
  invited: 0,
  dailyStreak: 0,
  dailyClaimedAt: 0
};

function loadState() {
  try {
    return { ...defaultState, ...(JSON.parse(localStorage.getItem(STORAGE)) || {}) };
  } catch {
    return defaultState;
  }
}

function App() {
  const [game, setGame] = useState(loadState);
  const [tab, setTab] = useState("home");
  const [tapFx, setTapFx] = useState([]);

  useEffect(() => {
    tg?.ready();
    tg?.expand();
    tg?.setHeaderColor?.("#111111");
    tg?.setBackgroundColor?.("#111111");
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE, JSON.stringify(game));
  }, [game]);

  useEffect(() => {
    const timer = setInterval(() => {
      setGame(g => {
        const now = Date.now();
        const seconds = Math.min(5, (now - g.lastEnergyTick) / 1000);
        const recharge = seconds * 2;
        const passive = seconds * (g.incomePerHour / 3600);
        return {
          ...g,
          energy: Math.min(g.maxEnergy, g.energy + recharge),
          coins: g.coins + passive,
          lastEnergyTick: now
        };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const upgradeCost = useMemo(() => Math.floor(50 * Math.pow(1.65, game.level - 1)), [game.level]);

  function tap(e) {
    if (game.energy < game.power) return;
    const id = Date.now() + Math.random();
    setTapFx(x => [...x, { id, x: e?.clientX || innerWidth / 2, y: e?.clientY || innerHeight / 2 }]);
    setTimeout(() => setTapFx(x => x.filter(a => a.id !== id)), 500);
    tg?.HapticFeedback?.impactOccurred?.("light");
    setGame(g => ({ ...g, coins: g.coins + g.power, energy: Math.max(0, g.energy - g.power) }));
  }

  function upgrade() {
    if (game.coins < upgradeCost) return;
    tg?.HapticFeedback?.impactOccurred?.("medium");
    setGame(g => ({
      ...g,
      coins: g.coins - upgradeCost,
      power: g.power + 1,
      level: g.level + 1,
      maxEnergy: g.maxEnergy + 25
    }));
  }

  function daily() {
    const today = new Date().toDateString();
    if (new Date(game.dailyClaimedAt).toDateString() === today) return;
    const reward = 250 + game.dailyStreak * 100;
    setGame(g => ({ ...g, coins: g.coins + reward, dailyStreak: g.dailyStreak + 1, dailyClaimedAt: Date.now() }));
    tg?.HapticFeedback?.notificationOccurred?.("success");
  }

  const username = tg?.initDataUnsafe?.user?.first_name || "BOOF Player";
  const fakeLeaders = [
    ["BOOF KING", 98420], ["CryptoFox", 77110], ["Mina", 65200], [username, Math.floor(game.coins)]
  ].sort((a,b) => b[1]-a[1]);

  return (
    <main className="app">
      <header className="top">
        <div>
          <div className="brand">BOOF</div>
          <div className="hello">سلام، {username} 👋</div>
        </div>
        <div className="level">LVL {game.level}</div>
      </header>

      {tab === "home" && (
        <>
          <section className="stats">
            <div><span>🪙</span><b>{Math.floor(game.coins).toLocaleString()}</b><small>COINS</small></div>
            <div><span>⚡</span><b>{Math.floor(game.energy)}</b><small>ENERGY</small></div>
            <div><span>🚀</span><b>+{game.incomePerHour}</b><small>/ HOUR</small></div>
          </section>

          <section className="coin-zone">
            <div className="coin-glow"></div>
            <button className="boof" onClick={tap} aria-label="Tap BOOF">
              <div className="eyes"><i></i><i></i></div>
              <div className="beak"></div>
              <div className="wings left"></div>
              <div className="wings right"></div>
            </button>
            {tapFx.map(f => <span className="fx" key={f.id} style={{left:f.x,top:f.y}}>+{game.power}</span>)}
            <p>برای دریافت سکه روی BOOF بزن</p>
          </section>

          <section className="energy">
            <div className="energy-row"><b>⚡ {Math.floor(game.energy)} / {game.maxEnergy}</b><span>+2/sec</span></div>
            <div className="bar"><div style={{width:`${Math.min(100, game.energy/game.maxEnergy*100)}%`}} /></div>
          </section>

          <section className="cards">
            <div className="card">
              <div><span>🆙</span><strong>قدرت کلیک</strong><small>هر کلیک +{game.power} سکه</small></div>
              <button onClick={upgrade} disabled={game.coins < upgradeCost}>🪙 {upgradeCost.toLocaleString()}</button>
            </div>
            <div className="card">
              <div><span>🤖</span><strong>درآمد خودکار</strong><small>سکه در ساعت</small></div>
              <button onClick={() => setGame(g => ({...g, coins: g.coins >= 500 ? g.coins-500 : g.coins, incomePerHour: g.coins >= 500 ? g.incomePerHour+100 : g.incomePerHour}))} disabled={game.coins < 500}>🪙 500</button>
            </div>
          </section>
        </>
      )}

      {tab === "tasks" && (
        <section className="page">
          <h2>🎁 پاداش‌ها</h2>
          <div className="task" onClick={daily}><span>📅</span><div><b>Daily Reward</b><small>امروز جایزه‌ات را بگیر</small></div><strong>+{250 + game.dailyStreak*100}</strong></div>
          <div className="task"><span>👥</span><div><b>Invite Friends</b><small>دوست دعوت کن و جایزه بگیر</small></div><strong>+1,000</strong></div>
          <div className="task"><span>⭐</span><div><b>Coming Soon</b><small>ماموریت‌های بیشتر به‌زودی</small></div><strong>LOCK</strong></div>
        </section>
      )}

      {tab === "friends" && (
        <section className="page center">
          <div className="big-icon">👥</div>
          <h2>دوستاتو دعوت کن</h2>
          <p>برای هر دوست جدید، جایزه دریافت کن.</p>
          <div className="invite">https://t.me/BOOF_Bot?start=ref_demo</div>
          <button className="primary" onClick={() => navigator.clipboard?.writeText("https://t.me/BOOF_Bot?start=ref_demo")}>کپی لینک دعوت</button>
          <div className="counter">دعوت‌شده‌ها: {game.invited}</div>
        </section>
      )}

      {tab === "leaders" && (
        <section className="page">
          <h2>🏆 رتبه‌بندی</h2>
          {fakeLeaders.map((x,i) => <div className={`leader ${x[0]===username ? "me":""}`} key={x[0]}><b>#{i+1}</b><span>{x[0]}</span><strong>🪙 {x[1].toLocaleString()}</strong></div>)}
        </section>
      )}

      <nav>
        <button className={tab==="home"?"active":""} onClick={()=>setTab("home")}>🏠<small>خانه</small></button>
        <button className={tab==="tasks"?"active":""} onClick={()=>setTab("tasks")}>🎁<small>پاداش</small></button>
        <button className={tab==="friends"?"active":""} onClick={()=>setTab("friends")}>👥<small>دوستان</small></button>
        <button className={tab==="leaders"?"active":""} onClick={()=>setTab("leaders")}>🏆<small>رتبه‌ها</small></button>
      </nav>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
