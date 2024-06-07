import newDiagramXML from './newDiagram.bpmn';
import BpmnPerformanceVisualizer from '..';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import stats from './stats.json';

const canvas = document.querySelector('#canvas');

const modeler = new BpmnModeler({
  container: canvas,
  additionalModules: [
    BpmnPerformanceVisualizer
  ],
  keyboard: {
    bindTo: document
  }
});

const monitoring = modeler.get('bpmnPerformanceVisualizer');
monitoring.setStats(stats);

modeler.importXML(newDiagramXML).then(result => {
  const { warnings = [] } = result;

  if (warnings.length) {
    console.log('imported with warnings', warnings);
  }
}).catch(error => {
  console.error('import error', error);
});

document.getElementById('mode-count').addEventListener('click', () => {
  monitoring.setMode('count');
});

document.getElementById('mode-time').addEventListener('click', () => {
  monitoring.setMode('time_minutes');
});

document.getElementById('mode-avg').addEventListener('click', () => {
  monitoring.setMode('avg_minutes');
});
