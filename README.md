# bpmn-js Performance Visualizer

A plugin for BPMN diagrams that visualizes performance metrics directly on the diagram. This plugin is essential for analyzing and understanding the performance of complex BPMN workflows, allowing you to easily visualize and identify key performance metrics for each element.

![Sample](https://raw.githubusercontent.com/loremipsumowski/bpmn-js-performance-visualizer/main/resources/sample.png)

## Features

- **Performance Metrics Display**: Automatically displays performance metrics (count, time in minutes, average time in minutes) of BPMN elements.
- **Customizable**: Easily toggle between different performance metrics.
- **Seamless Integration**: Works with BPMN-js out of the box.
- **Development and Production Builds**: Optimized builds for both development and production environments.

## Demo

You can see a live demo of this project [here](https://loremipsumowski.github.io/bpmn-js-performance-visualizer/).

## Usage

### Installation

First, install the plugin using npm:

```bash
npm install bpmn-js-performance-visualizer
```

### Example with BpmnModeler

Here is an example of how to use the `bpmn-js Performance Visualizer` plugin with `BpmnModeler`:

```javascript
import BpmnModeler from 'bpmn-js/lib/Modeler';
import BpmnPerformanceVisualizer from 'bpmn-js-performance-visualizer';
import diagramXML from './diagram.bpmn';
import stats from './stats.json';

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

modeler.importXML(diagramXML, function(err) {
  if (err) {
    console.error('Error importing BPMN diagram', err);
  } else {
    console.log('BPMN diagram imported successfully');
  }
});
```

## Development

To start the development server, run:

```bash
npm start
```

## Build

To build the library for production, run:

```bash
npm run build
```

This will create a bundled file `bpmn-js-performance-visualizer.bundle.js` in the `dist` directory.

## Linting

To lint the code and automatically fix issues, run:

```bash
npm run lint
```

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Author

Przemysław Niedziela - [GitHub](https://github.com/loremipsumowski)

---

Feel free to modify and extend the project to suit your needs!
