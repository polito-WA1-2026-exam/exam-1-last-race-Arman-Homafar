import { ArrowRight, Coins } from 'lucide-react';

function ExecutionStepCard({ step }) {
  const eventSign = step.eventEffect > 0 ? '+' : '';

  return (
    <article className="step-card">
      <div className="step-line">
        <strong>{step.stepIndex}. {step.fromStationName}</strong>
        <span className="movement-arrow">
          <ArrowRight size={18} aria-hidden="true" />
        </span>
        <strong>{step.toStationName}</strong>
      </div>
      <p className="event-row">
        <span className="line-chip" style={{ borderColor: step.lineColor }}>{step.lineName}</span>
        {step.eventDescription} ({eventSign}{step.eventEffect})
      </p>
      <p className="coins-row">
        <Coins size={18} aria-hidden="true" />
        {step.coinBefore} -&gt; {step.coinAfter} coins
      </p>
    </article>
  );
}

export default ExecutionStepCard;
