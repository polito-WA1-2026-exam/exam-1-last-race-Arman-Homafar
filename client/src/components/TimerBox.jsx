function TimerBox({ seconds, totalSeconds = 90 }) {
  const progress = Math.max(0, Math.min(1, seconds / totalSeconds)) * 100;

  return (
    <div className={`timer ${seconds <= 15 ? 'urgent' : ''}`} style={{ '--timer-progress': `${progress}%` }} aria-live="polite">
      <span>{seconds}</span>
      <small>seconds left</small>
    </div>
  );
}

export default TimerBox;
