(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';

    if (has(cache, path)) return cache[path].exports;
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex].exports;
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  var define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  var list = function() {
    var result = [];
    for (var item in modules) {
      if (has(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  globals.require = require;
  globals.require.define = define;
  globals.require.register = define;
  globals.require.list = list;
  globals.require.brunch = true;
})();
require.register("application", function(exports, require, module) {
module.exports = {

    initialize: function() {
        var Router = require('router');
        this.router = new Router();
        Backbone.history.start();
    }
};
});

;require.register("collections/receipts", function(exports, require, module) {
Receipt = require('../models/receipt');
module.exports = ReceiptDetails = Backbone.Collection.extend({
    model: Receipt,
    url: 'receipts'
})

});

;require.register("initialize", function(exports, require, module) {
// The function called from index.html
$(document).ready(function() {
    var app = require('application');

    var locale = 'fr'; // default locale

    // we'll need to tweak the server to allow this
    $.ajax('cozy-locale.json', {
        success: function(data) {
            locale = data.locale
            initializeLocale(locale);
        },
        error: function() {
            initializeLocale(locale);
        }
    });

    // let's define a function to initialize Polyglot
    var initializeLocale = function(locale) {
        var locales = {};
        try {
            locales = require('locales/' + locale);
        }
        catch(err) {
            locales = require('locales/en');
        }

        var polyglot = new Polyglot();
        // we give polyglot the data
        polyglot.extend(locales);

        // handy shortcut
        window.t = polyglot.t.bind(polyglot);
        app.initialize();
    };
});

});

;require.register("locales/en", function(exports, require, module) {
module.exports = {
    "main title": "Welcome to MyInfo Nutritional",
    "main description": "This application will help you track your shopping from nutrional point of view!",
}
});

;require.register("locales/fr", function(exports, require, module) {
module.exports = {
    "main title": "Bienvenue sur MesInfos Nutritionelles",
    "main description": "Cette application vous permet de suivre vos achats en termes nutrionnels. !",
}
});

;require.register("models/receipt", function(exports, require, module) {
module.exports = Receipt = Backbone.Model.extend({

})

});

;require.register("router", function(exports, require, module) {
var AppView = require('views/app_view');
var ReceiptCollection = require('collections/receipts');

var receipts = new ReceiptCollection();
var mainView;

module.exports = Router = Backbone.Router.extend({

    routes: {
        '': 'info',
        'info': 'info',
        'stats': 'stats',
        'coach': 'coach',
        'control': 'control',
        '*path' : 'main'
    },

    main: function() {
        this.mainView = new AppView({
            collection: receipts
        });
        this.mainView.render();
    },
    
    info: function(){
    	if(!this.mainView)
    		this.main();
    	this.mainView.infoView();
    },
    
    stats: function(){
    	if(!this.mainView)
    		this.main();
    	this.mainView.statsView();
    },
    
    coach: function(){
    	if(!this.mainView)
    		this.main();
    	this.mainView.coachView();
    },
    
    control: function(){
    	if(!this.mainView)
    		this.main();
    	this.mainView.controlView();
    }
});
});

;require.register("templates/coach", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('coach');
}
return buf.join("");
};
});

;require.register("templates/control", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div class="col-md-9"><H2> Ecran de controle</H2><p>Ce formulaire vous permet de lister les produits dont les informations nutritionnelles n\'ont pas été saisies dans la base de données openfood facts.<br/>\nles informations saisies ici seront envoyées à OpenFoodFacts pour réutilisation par d\'autre personnes du panel MesInfos et plus généralement par tous les utilisateurs de la base de donnée ouverte Open food Facts.<br/>\nMerci de saisir les données nutritionnelles avec soins.</p></div><div class="col-md-3 text-center"><img src="openfoodfacts-logo-fr.png"/></div><div class="col-md-12"><form role="form" action="postFoodfacts" method="post"><table class="table table-striped table-hover table-condensed"><thead><th colspan="5"><button type="submit" class="btn btn-primary">Envoyer les modifications</button></th></thead><thead><th class="col-md-2">référence intermarché<br/>code bare</th><th class="col-md-1">dernière date d\'achat</th><th class="col-md-2">nom de l\'article</th><th class="col-md-1 text-center">poid<br/>(Grammes)</th><th class="col-md-1 text-center">calories <br/>(KJoules)</th><th class="col-md-1 text-center">lipides <br/>(Grammes)</th><th class="col-md-1 text-center">proteines <br/>(Grammes)</th><th class="col-md-1 text-center">glucides <br/>(Grammes)</th></thead><tbody id="products-body"></tbody><tfoot><td colspan="5"><button type="submit" class="btn btn-primary">Envoyer les modifications</button></td></tfoot></table></form></div><script id="template-row" type="text/html"><tr><td style="vertical-align:middle"> <table><tr><td><img src="http://drive.intermarche.com/ressources/images/produit/vignette/0<%= barcode %>.jpg" width="53" height="53" class="image"/></td><td><%= shop_label %><br/><%= barcode %></td></tr></table></td><td style="vertical-align:middle"><%= new Date(last_update).toLocaleDateString() %></td><td><input name="changed_<%= barcode %>" type="hidden" value="false"/><input name="name_<%= barcode %>" type="text" placeholder="Nom de l\'article" value="<%= name?name:\'\' %>" class="form-control"/></td><td><div class="input-group"><input name="weight_<%= barcode %>" type="text" placeholder="poid" value="<%= (typeof weight != \'undefined\')?weight:\'\' %>" class="form-control"/><span class="input-group-addon">g</span></div></td><td><div class="input-group"><input name="energy_<%= barcode %>" type="text" placeholder="energy" value="<%= (typeof energy != \'undefined\')?energy:\'\' %>" class="form-control"/><span class="input-group-addon">Kj</span></div></td><td><div class="input-group"><input name="fat_<%= barcode %>" type="text" placeholder="lipides" value="<%= (typeof fat != \'undefined\')?fat:\'\' %>" class="form-control"/><span class="input-group-addon">g</span></div></td><td><div class="input-group"><input name="proteins_<%= barcode %>" type="text" placeholder="protéines" value="<%= (typeof proteins != \'undefined\')?proteins:\'\' %>" class="form-control"/><span class="input-group-addon">g</span></div></td><td><div class="input-group"><input name="carbohydrates_<%= barcode %>" type="text" placeholder="glucides" value="<%= (typeof carbohydrates != \'undefined\')?carbohydrates:\'\' %>" class="form-control"/><span class="input-group-addon">g</span></div></td></tr></script>');
}
return buf.join("");
};
});

;require.register("templates/data", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div><script id="header" type="text/html"><div class="col-md-12"><H2> Détail des achats du jour <%= new Date(day).toLocaleDateString() %></H2><p>Vous pouvez voir et corriger ici les info nutritionnelles associé au ticket de caisse selectionné.<br/>\nles informations saisies ici seront envoyées à OpenFoodFacts pour réutilisation par d\'autre personnes du panel MesInfos et plus généralement par tous les utilisateurs de la base de donnée ouverte Open food Facts.<br/>\nMerci de saisir les données nutritionnelles avec soins.\nLes statisitues seront mise à jour après correction.</p></div><div class="col-md-12"><form role="form" action="postFoodfacts" method="post"><table class="table table-striped table-hover table-condensed"><thead><th colspan="5"><button type="submit" class="btn btn-primary">Envoyer les modifications</button></th></thead><thead><th class="col-md-2">référence intermarché<br/>code bare</th><th class="col-md-2">nom de l\'article</th><th class="col-md-1 text-center">poid<br/>(Grammes)</th><th class="col-md-1 text-center">calories <br/>(KJoules)</th><th class="col-md-1 text-center">lipides <br/>(Grammes)</th><th class="col-md-1 text-center">proteines <br/>(Grammes)</th><th class="col-md-1 text-center">glucides <br/>(Grammes)</th></thead><tbody id="products-body"></tbody><tfoot><td colspan="5"><button type="submit" class="btn btn-primary">Envoyer les modifications</button></td></tfoot></table></form></div></script><script id="template-row" type="text/html"><tr><td style="vertical-align:middle"> <table><tr><td><img src="http://drive.intermarche.com/ressources/images/produit/vignette/0<%= barcode %>.jpg" width="53" height="53" class="image"/></td><td><%= shop_label %><br/><%= barcode %></td></tr></table></td><td><input name="changed_<%= barcode %>" type="hidden" value="false"/><input name="name_<%= barcode %>" type="text" placeholder="Nom de l\'article" value="<%= name?name:\'\' %>" class="form-control"/></td><td><div class="input-group"><input name="weight_<%= barcode %>" type="text" placeholder="poid" value="<%= (typeof weight != \'undefined\')?weight:\'\' %>" class="form-control"/><span class="input-group-addon">g</span></div></td><td><div class="input-group"><input name="energy_<%= barcode %>" type="text" placeholder="energy" value="<%= (typeof energy != \'undefined\')?energy:\'\' %>" class="form-control"/><span class="input-group-addon">Kj</span></div></td><td><div class="input-group"><input name="fat_<%= barcode %>" type="text" placeholder="lipides" value="<%= (typeof fat != \'undefined\')?fat:\'\' %>" class="form-control"/><span class="input-group-addon">g</span></div></td><td><div class="input-group"><input name="proteins_<%= barcode %>" type="text" placeholder="protéines" value="<%= (typeof proteins != \'undefined\')?proteins:\'\' %>" class="form-control"/><span class="input-group-addon">g</span></div></td><td><div class="input-group"><input name="carbohydrates_<%= barcode %>" type="text" placeholder="glucides" value="<%= (typeof carbohydrates != \'undefined\')?carbohydrates:\'\' %>" class="form-control"/><span class="input-group-addon">g</span></div></td></tr></script></div>');
}
return buf.join("");
};
});

;require.register("templates/home", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<head><script src="Chart.js"> </script></head><nav role="navigation" class="navbar navbar-default navbar-fixed-top"><div class="container"><div class="navbar-header"><button type="button" data-toggle="collapse" data-target=".navbar-collapse" class="navbar-toggle"><span class="icon-bar"></span><span class="icon-bar"></span><span class="icon-bar"></span></button><a href="#info" class="navbar-brand">MesInfos Nutritionelles</a></div><div class="navbar-collapse collapse"><ul class="nav navbar-nav"><li><a href="#stats"> Mes Statistiques</a></li><li><a href="#control"> Vérifications</a></li><li class="dropdown"><a href="#" data-toggle="dropdown" class="dropdown-toggle">A Propos<ul class="dropdown-menu"><li> <a href="#">&copy; 2013 Lookal</a></li><li> <a href="mail:pdelorme@lookal.fr">contact: pdelorme@lookal.fr</a></li><li> <a href="#">Merci à la Fing et à OpenFoodFacts pour leur assistance.<br/>\nLongue vie à mes infos</a></li></ul></a></li></ul></div></div></nav><div class="container">                      <br/><br/><br/><div id="tab-content"></div></div>');
}
return buf.join("");
};
});

;require.register("templates/info", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<h1>');
var __val__ = t('main title')
buf.push(escape(null == __val__ ? "" : __val__));
buf.push('</h1><p>');
var __val__ = t('main description')
buf.push(escape(null == __val__ ? "" : __val__));
buf.push('</p>');
}
return buf.join("");
};
});

;require.register("templates/stats", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div class="col-md-9"><H2> Statistiques d\'achat nutritionnelles</H2><p>Ce diagramme montre les calories, protéines, lipides et glucides par date d\'acaht et éttalé dans le temps.<br/>\nen cliquant sur une date, vous pourez voir la liste des achats du jour et cérifier/compléter les informations nutritionnelles de chaques produits afin de corriger votre diagramme.</p></div><div class="col-md-3 text-center"><img src="openfoodfacts-logo-fr.png"/></div><div id="chartContainer" class="col-md-12 chart"><div id="chartEnergyContainer" class="col-md-6 chart"></div><div id="chartNutritionContainer" class="col-md-6 chart"></div></div><div id="dataContainer"></div>');
}
return buf.join("");
};
});

;require.register("views/app_view", function(exports, require, module) {
var StatsView = require('./info_view');
var StatsView = require('./stats_view');
var CoachView = require('./coach_view');
var ControlView = require('./control_view');
var DataView = require('./data_view');

module.exports = AppView = Backbone.View.extend({

    el: 'body',
    template: require('../templates/home'),
    events: {
    },

    // initialize is automatically called once after the view is constructed
    initialize: function() {
        // this.listenTo(this.collection, "add", this.onBookmarkAdded);
    },

    render: function() {

        // we render the template
        this.$el.html(this.template());

        // fetch the receipts from the database
        this.collection.fetch();
    },

    infoView: function(event) {
        // render the stats view
        infoView = new InfoView({
            model: this.collection
        });
        infoView.render();
        this.$el.find('#tab-content').html(infoView.$el);
    },
    
    statsView: function(event) {
      // render the stats view
      statsView = new StatsView({
          model: this.collection
      });
      statsView.render();
      this.$el.find('#tab-content').html(statsView.$el);
    },
    
    coachView:function(event){
		coachView = new CoachView({
	        model: this.collection
	    });
	    coachView.render();
	    this.$el.find('#tab-content').html(coachView.$el);
    },
    
    controlView:function(event){
		controlView = new ControlView({
	        model: this.collection
	    });
	    controlView.render();
	    this.$el.find('#tab-content').html(controlView.$el);
    }
});
});

;require.register("views/coach_view", function(exports, require, module) {
//var SectionView = require('./section');
var ReceiptCollection = require('../collections/receipts');

module.exports = StatsView = Backbone.View.extend({

    tagName: 'div',
    template: require('../templates/coach'),
    events: {
        //"click .receipt": "toggleSections",    
        //"click .toggle": "toggleSectionsNoDefault"    
    },

    initialize: function() {
        // this.collection = new ReceiptCollection([], { receiptId: this.model.attributes.receiptId });
        
    },

    render: function() {
        this.$el.html(this.template({
            receipt: this.model.toJSON()
        }));
    },
    
});


});

;require.register("views/control_view", function(exports, require, module) {
//var SectionView = require('./section');
var ReceiptCollection = require('../collections/receipts');

module.exports = ControlView = Backbone.View.extend({

    tagName: 'div',
    template: require('../templates/control'),
    events: {
    	"submit form":"postData",
    	"change input.form-control" : "formChange"
        //"click .receipt": "toggleSections",    
        //"click .toggle": "toggleSectionsNoDefault"    
    },

    initialize: function() {
        // this.collection = new ReceiptCollection([], { receiptId: this.model.attributes.receiptId });
        
    },

    render: function() {
        this.$el.html(this.template());
        this.getData();
    },
    
    getData: function(){
    	// asks server for product without infos.
    	var that = this;
    	var productBody = this.$el.find("#products-body");
    	productBody.html("");
    	var productRowTemplate = _.template(this.$el.find("#template-row").html());
    	$.getJSON('invalidProducts', function(data) {
        	productBody.html("");
    		$.each(data, function(key, val) {
    			productBody.append(productRowTemplate(val));
    		});
    	});
    },
    
    postData: function(e){
    	e.preventDefault();
    	var formData = $("form").serialize();
    	var productBody = this.$el.find("#products-body");
    	var productRowTemplate = _.template(this.$el.find("#template-row").html());
    	var that = this;
    	
    	$.ajax({
		  type: "POST",
		  url: 'postFoodfacts',
		  data: formData,
		  dataType: "json",
          beforeSend: function(){$("#modal-overlay").show();},
          complete: function(){$("#modal-overlay").hide();},
		  success: function(data) {
	        	that.getData();
	    	},
		});
    	
//    	$.postJSON('postFoodfacts', formData, function(data) {
//        	productBody.html("");
//    		$.each(data, function(key, val) {
//    			productBody.append(productRowTemplate(val));
//    		});
//    	});
    },
    formChange: function(e){
    	var id = e.target.name.split('_')[1];
    	$("[name='changed_"+id+"']").val("true");
    }
    
});


});

;require.register("views/data_view", function(exports, require, module) {
//var SectionView = require('./section');
var ReceiptCollection = require('../collections/receipts');

module.exports = DataView = Backbone.View.extend({

    tagName: 'div',
    template: require('../templates/data'),
    events: {
    	"submit form":"postData",
    	"change input.form-control" : "formChange"
        //"click .receipt": "toggleSections",    
        //"click .toggle": "toggleSectionsNoDefault"    
    },

    initialize: function() {
        // this.collection = new ReceiptCollection([], { receiptId: this.model.attributes.receiptId });
        this.day = this.options.day;
        this.statsView = this.options.statsView;
    },

    render: function() {
    	var headerTemplate = _.template($(this.template()).find("#header").html());
        var html = headerTemplate({day:this.day});
    	this.$el.html(html);
        this.getData();
    },
    
    getData: function(){
    	// asks server for product without infos.
    	var that = this;
    	var productBody = this.$el.find("#products-body");
    	var productRowTemplate = _.template($(this.template()).find("#template-row").html());
    	$.getJSON('dayFacts?day='+this.day, function(data) {
        	productBody.html("");
    		$.each(data, function(key, val) {
    			productBody.append(productRowTemplate(val));
    		});
    	});
    },
    
    postData: function(e){
    	e.preventDefault();
    	var formData = $("form").serialize();
    	var that = this;
    	
    	$.ajax({
		  type: "POST",
		  url: 'postFoodfacts',
		  data: formData,
		  //dataType: "json",
          beforeSend: function(){$("#modal-overlay").show();},
          complete: function(){ $("#modal-overlay").hide();},
		  success: function(data) {
			  that.getData();
			  that.statsView.updateChart();
	    	},
		});
    	
//    	$.postJSON('postFoodfacts', formData, function(data) {
//        	productBody.html("");
//    		$.each(data, function(key, val) {
//    			productBody.append(productRowTemplate(val));
//    		});
//    	});
    },
    formChange: function(e){
    	var id = e.target.name.split('_')[1];
    	$("[name='changed_"+id+"']").val("true");
    }
    
});


});

;require.register("views/info_view", function(exports, require, module) {
//var SectionView = require('./section');
var ReceiptCollection = require('../collections/receipts');

module.exports = InfoView = Backbone.View.extend({

    tagName: 'div',
    template: require('../templates/info'),
    events: {
        //"click .receipt": "toggleSections",    
        //"click .toggle": "toggleSectionsNoDefault"    
    },

    initialize: function() {
        // this.collection = new ReceiptCollection([], { receiptId: this.model.attributes.receiptId });
        
    },

    render: function() {
        this.$el.html(this.template({
            receipt: this.model.toJSON()
        }));
    },
    
});


});

;require.register("views/stats_view", function(exports, require, module) {
//var SectionView = require('./section');
var ReceiptCollection = require('../collections/receipts');

module.exports = StatsView = Backbone.View.extend({

    tagName: 'div',
    template: require('../templates/stats'),
    events: {
        //"click .receipt": "toggleSections",    
        //"click .toggle": "toggleSectionsNoDefault"    
    },

    initialize: function() {
    },

    render: function() {
        this.$el.html(this.template({
            receipt: this.model.toJSON()
        }));
        var that = this;
        // async to allow proper refresh.
        setTimeout(function(){
        	that.updateChart();
        },0);
    },
    
    updateChart: function (callback) {
    	var energyPoints = [];
    	var fatPoints = [];
    	var proteinsPoints = [];
    	var carbohydratesPoints = [];
    	var averageEnergyPoints = [];
    	var averageFatPoints = [];
    	var averageProteinsPoints = [];
    	var averageCarbohydratesPoints = [];
    	var chartEnergyContainer = this.$el.find("#chartEnergyContainer");
    	var chartNutritionContainer = this.$el.find("#chartNutritionContainer");
    	var that = this;
		var chartEnergy = new CanvasJS.Chart(chartEnergyContainer,{
			zoomEnabled: true,
		    panEnabled: true, 
			title:{
				text: "Energie",
				padding:0,
				maring:0,
				verticalAlign: "top", // "top", "center", "bottom"
		        horizontalAlign: "center" // "left", "right", "center"
		        	
			}, 
			axisX:{
			   labelAngle: 50,
			   valueFormatString: "D MMM",
			   lineThickness:0,
			   gridThickness:0,
			   tickThickness:0,
			   interval:1,
			   intervalType:"week"
			},
			axisY:{
				//title:"Kilo Joules : Grammes",
				valueFormatString: "0.##",
				labelFontSize:1,
				//labelFontColor:000,
				lineThickness:0,
				gridThickness:0,
				tickThickness:0,
				minimum:0,
				interval:1000
			},
			legend:{
				verticalAlign: "bottom",
				horizontalAlign: "center",
				fontSize: 15,
				fontFamily: "Lucida Sans Unicode"

			},
			data: [
			       // energy
			       {
			    	   type: "area",
			    	   color: "rgba(54,158,173,.3)",
			    	   showInLegend: true,
			    	   name:"energie/jour (Kj)",
			    	   dataPoints: averageEnergyPoints,
			    	   markerType:"none",
			    	   //markerColor:"red",
			       },
			       {
			    	   type: "column",
			    	   color: "rgba(54,158,173,1)",
			    	   showInLegend: true,
			    	   name:"energie (Kj)",
			    	   width:50,
			    	   click: function(e){ 
			    		   that.showTicketData(e.dataPoint.x);
			    	   },
			    	   dataPoints: energyPoints,
			    	   indexLabelPlacement:"outside",
			    	   indexLabelAngle:50,
			    	   //indexLabel: "{y}"
			       }
			 ]
		});
		var chartNutrition = new CanvasJS.Chart(chartNutritionContainer,{
			zoomEnabled: true,
		    panEnabled: true, 
			title:{
				text: "Eléments Nutritionnels",
				padding:0,
				maring:0,
				verticalAlign: "top", // "top", "center", "bottom"
		        horizontalAlign: "center" // "left", "right", "center"
		        	
			}, 
			axisX:{
			   labelAngle: 50,
			   valueFormatString: "D MMM",
			   lineThickness:0,
			   gridThickness:0,
			   tickThickness:0,
			   interval:1,
			   intervalType:"week"
			},
			axisY:{
				//title:"Kilo Joules : Grammes",
				valueFormatString: "0.##",
				labelFontSize:1,
				lineThickness:0,
				gridThickness:0,
				tickThickness:0,
				minimum:0,
				interval:1000
			},
			legend:{
				verticalAlign: "bottom",
				horizontalAlign: "center",
				fontSize: 15,
				fontFamily: "Lucida Sans Unicode"

			},
			data: [
			       // fat
			       {
			    	   type: "stackedColumn",
			    	   color: "rgba(8,15,173,.7)",
			    	   showInLegend: true,
			    	   name:"lipides (g)",
			    	   click: function(e){ 
			    		   that.showTicketData(e.dataPoint.x);
			    	   },
			    	   dataPoints: fatPoints,
			    	   indexLabelPlacement:"outside",
			    	   indexLabelAngle:50,
			    	   //indexLabel: "{y}"
			       },
			       {
			    	   type: "stackedArea",
			    	   color: "rgba(8,15,173,.3)",
			    	   //showInLegend: true,
			    	   name:"lipides/jour (g)",
			    	   dataPoints: averageFatPoints,
			    	   markerType:"none"
			       },
			       // proteins
			       {
			    	   type: "stackedColumn",
			    	   color: "rgba(54,58,73,.7)",
			    	   showInLegend: true,
			    	   name:"protéines (g)",
			    	   click: function(e){ 
			    		   that.showTicketData(e.dataPoint.x);
			    	   },
			    	   dataPoints: proteinsPoints,
			    	   indexLabelPlacement:"outside",
			    	   indexLabelAngle:50,
			    	   //indexLabel: "{y}"
			       },
			       {
			    	   type: "stackedArea",
			    	   color: "rgba(54,58,73,.3)",
			    	   //showInLegend: true,
			    	   name:"protéines/jour (g)",
			    	   dataPoints: averageProteinsPoints,
			    	   markerType:"none"
			       },
			       // carbohydrates
			       {
			    	   type: "stackedColumn",
			    	   color: "rgba(54,158,73,.7)",
			    	   showInLegend: true,
			    	   name:"glucides (g)",
			    	   click: function(e){ 
			    		   that.showTicketData(e.dataPoint.x);
			    	   },
			    	   dataPoints: carbohydratesPoints,
			    	   indexLabelPlacement:"outside",
			    	   indexLabelAngle:50,
			    	   //indexLabel: "{y}"
			       },
			       {
			    	   type: "stackedArea",
			    	   color: "rgba(54,158,73,.3)",
			    	   //showInLegend: true,
			    	   name:"glucides/jour (g)",
			    	   dataPoints: averageCarbohydratesPoints,
			    	   markerType:"none"
			       }
			 ]
		});
		this.chartEnergy = chartEnergy;
		this.chartNutrition = chartNutrition;
		// empty energyPoints.
    	energyPoints.length = 0;
    	averageEnergyPoints.length = 0;
    	fatPoints.length = 0;
    	averageFatPoints.length = 0;
    	proteinsPoints.length = 0;
    	averageProteinsPoints.length = 0;
    	carbohydratesPoints.length = 0;
    	averageCarbohydratesPoints.length = 0;
		// build stats.
		$.getJSON('receiptStats', function(data) {
			var receiptStats = data;
			var prevDay;
			var prevEnergy;
			var prevFat;
			var prevProteins;
			var prevCarbohydrates;
			$.each(receiptStats, function(key, val) {
				var date = new Date(val.timestamp);
				var day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
				var energy        = val.energy;
				var fat           = val.fat;
				var proteins      = val.proteins;
				var carbohydrates = val.carbohydrates;
				if(prevDay){
					days = ((day.getTime()-prevDay.getTime())/(1000*60*60*24));
					if(days==0) {
						lastEnergyPoint = energyPoints.pop();
						energy = lastEnergyPoint.y + energy;
						
						lastFatPoint = fatPoints.pop();
						fat = lastFatPoint.y + fat;
						
						lastProteinsPoint = proteinsPoints.pop();
						proteins = lastProteinsPoint.y + proteins;
						
						lastCarbohydratesPoint = carbohydratesPoints.pop();
						carbohydrates = lastCarbohydratesPoint.y + carbohydrates;
					}
					else {
						meanEnergy = Math.round(prevEnergy / days * 100) / 100;
						meanFat = Math.round(prevFat / days * 100) / 100;
						meanProteins = Math.round(prevProteins / days * 100) / 100;
						meanCarbohydrates = Math.round(prevCarbohydrates / days * 100) / 100;

						//for(var theTime = prevDay.getTime(); theTime<day.getTime(); theTime+=(1000*60*60*24)){
							theTime=prevDay.getTime();
							averageEnergyPoints.push({x:new Date(theTime), y:meanEnergy});
							averageFatPoints.push({x:new Date(theTime), y:meanFat});
							averageProteinsPoints.push({x:new Date(theTime), y:meanProteins});
							averageCarbohydratesPoints.push({x:new Date(theTime), y:meanCarbohydrates});
							theTime=day.getTime();
							averageEnergyPoints.push({x:new Date(theTime), y:meanEnergy});
							averageFatPoints.push({x:new Date(theTime), y:meanFat});
							averageProteinsPoints.push({x:new Date(theTime), y:meanProteins});
							averageCarbohydratesPoints.push({x:new Date(theTime), y:meanCarbohydrates});
						//}
					}
				}
				prevDay           = day;
				prevEnergy        = energy;
				prevFat           = fat;
				prevProteins      = proteins;
				prevCarbohydrates = carbohydrates;
				console.log(day, energy, fat, proteins, carbohydrates);
				energyPoints.push({x:day, y: Math.round(energy*100)/100});
				fatPoints.push({x:day, y: Math.round(fat*100)/100});
				proteinsPoints.push({x:day, y: Math.round(proteins*100)/100});
				carbohydratesPoints.push({x:day, y: Math.round(carbohydrates*100)/100});
			});
			console.log("nb points:",energyPoints.length);
			
			// refresh view.
			chartEnergy.render();
			chartNutrition.render();
			if(callback)
				callback();
		});
	},
    showTicketData : function(timestamp){
    	var date = new Date(timestamp);
		var day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    	dataView = new DataView({
    		statsView:this,
    		day:day
    	});
        dataView.render();
        this.$el.find('#dataContainer').html(dataView.$el);
    }

});


});

;
//# sourceMappingURL=app.js.map