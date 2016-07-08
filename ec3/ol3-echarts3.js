/**
* ol3+echarts3 迁徙
*
*/
function Ol3Echarts(map,ec){
	this._map=map;
	this._option=null;
	this._ec=ec;
	this._mapOffset = [0, 0];
	
	var size=map.getSize();
	var div=this._echartsContainer=document.createElement("div");
	div.style.position = 'absolute';
    div.style.height = size[1] + 'px';
    div.style.width = size[0] + 'px';
    div.style.top = 0;
    div.style.left = 0;
    this._map.getViewport().appendChild(div);
    this._init(map,ec);
}
	
Ol3Echarts.prototype._init = function (map,ec) {
	var self=this;
	self._map=map;
	self._ec=ec;
	
	self.getEchartsContainer=function(){
		return self._echartsContainer;
	}
	
	self.getMap=function(){
		return self._map;
	}
	
	self.geoCoord2Pixel = function (geoCoord) {
        return self._map.getPixelFromCoordinate(ol.proj.fromLonLat(geoCoord));
    };

        
    self.pixel2GeoCoord = function (pixel) {
        return self._map.getCoordinateFromPixel(pixel);

    };
	
	self.initECharts=function(){
		self._ec=ec.init.apply(self,arguments);
		self._ec.Geo.prototype.dataToPoint=function(evt){
			var pt=self._map.getPixelFromCoordinate(evt);
			return pt;
		}
		self._bindEvent();
		return self._ec;
	}
	
	self._bindEvent=function(){
		self._map.getView().on('change:resolution',function(evt){
			self._echartsContainer.style.visibility="hidden";
		});
		self._map.on('pointerdrag',function(evt){
			self._echartsContainer.style.visibility="hidden";
		});
		self._map.on('moveend',function(evt){
			self._ec.resize();
			self._echartsContainer.style.visibility="visible";
		});
		self._map.on('change:size',function(evt){
			var e=self._echartsContainer.parentNode.parentNode.parentNode;
			self._mapOffset=[-parseInt(e.style.left)||0,-parseInt(e.style.top)||0];
			self._echartsContainer.style.left=self._mapOffset[0]+"px";
			self._echartsContainer.style.top=self._mapOffset[1]+"px";
			setTimeout(function(){
				self._ec.resize()},200);
			self._echartsContainer.style.visibility="visible";
		});
		self._ec.getZr().on('dragstart',function(evt){});
		self._ec.getZr().on('dragend',function(evt){});
		self._ec.getZr().on('mousewheel',function(evt){
			//self._lastMousePos=self._map.getCoordinateFromPixel([evt.event.x,evt.event.y]);
			var t=evt.wheelDelta;
			var n=self._map.getView();
			var a=n.getZoom();
			t=t>0?Math.ceil(t):Math.floor(t);
			t=Math.max(Math.min(t,4),-4);
			//t=Math.max(n.getMinZoom(),Math.min(n.getMaxZoom(),a+t))-a;
			//self._delta=0;
			//self._startTime=null;
			t&&n.setZoom(a+t);
		});
	}
	
	self.getECharts=function(){
		return self._ec;
	}
	self.getMapOffset = function () {
        return self._mapOffset;
    }
		
	self.setOption=function(option,notMerge){
		self._option=option;
		self._ec.setOption(option,notMerge);
	}
	
	return Ol3Echarts;
}