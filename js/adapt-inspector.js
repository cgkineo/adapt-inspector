import Adapt from 'core/js/adapt';
import location from 'core/js/location';
import InspectorContainerView from './InspectorContainerView';
import InspectorView from './InspectorView';

class Inspector extends Backbone.Controller {
  initialize() {
    this.listenToOnce(Adapt, 'app:dataReady', this.initInspector);
  }

  getLocationString(context) {
    const data = context.data.root;
    const id = data.length ? data[0]._id : data._id;
    const locationId = location._currentId;
    const locationType = location._contentType;

    return id !== locationId ? ' (' + locationType + ' ' + locationId + ')' : '';
  }

  initInspector() {
    const config = Adapt.config.get('_inspector');
    if (!config || !config._isEnabled) return;

    const defaultElements = [ 'menu', 'menuItem', 'page', 'article', 'block', 'component' ];
    const views = config._elementsToInspect || defaultElements;
    const eventList = views.map(view => { return view + 'View:postRender'; });

    Handlebars.registerHelper('inspector_location', this.getLocationString);

    Adapt.on('router:location', () => {
      new InspectorView();
    }).on(eventList.join(' '), (view) => {
      new InspectorContainerView({ el: view.$el, model: view.model });
    });
  }
}

export default new Inspector();
