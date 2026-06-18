import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import ExecutionStepCard from './ExecutionStepCard.jsx';

function StepViewer({ steps }) {
  const [visibleSteps, setVisibleSteps] = useState(1);
  const allStepsShown = visibleSteps >= steps.length;

  return (
    <section className="step-viewer">
      <div className="section-heading-row">
        <h2>Trip events</h2>
        <p className="muted small-text">{visibleSteps} of {steps.length} shown</p>
      </div>
      <div className="execution-list">
        {steps.slice(0, visibleSteps).map((step) => (
          <ExecutionStepCard key={step.stepIndex} step={step} />
        ))}
      </div>
      <button
        type="button"
        className="button primary"
        disabled={allStepsShown}
        onClick={() => setVisibleSteps((count) => Math.min(count + 1, steps.length))}
      >
        <ArrowRight size={18} aria-hidden="true" />
        {allStepsShown ? 'All steps shown' : 'Next step'}
      </button>
    </section>
  );
}

export default StepViewer;
