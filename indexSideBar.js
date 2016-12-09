// publish/subscribe pattern
;(function(){
	var emitter = {
		events: {},
		trigger (event, data) {
			var handlers = this.events[event];
			if(!handlers)return;
			handlers.forEach((fn) => {
				fn(data)
			})
		},
		subscribe (event, fn) {
			(this.events[event]) || (this.events[event] = []);
			this.events[event].push(fn);
		}
	};
	// subscribe events
	emitter.subscribe('fingerLand', (data) => {
		var content = data.innerHTML, indicator = document.querySelector('div.indicator');
		indicator.innerHTML = content;
		indicator.style.opacity = '1';
		indicator.style.top = data.getBoundingClientRect().top + 'px';
	});
	emitter.subscribe('fingerLand', (elem) => {
		var content = elem.innerHTML, scrolledElem = document.querySelector(`div.content > p[data-index=${content}]`);
		scrolledElem.scrollIntoView();
		console.log(content)
	})
	emitter.subscribe('fingerOff', () => {
		var indicator = document.querySelector('div.indicator');
		indicator.style.opacity = '0';
	})

	// constructor
	function IndexSidebar(options) {
		this.init(options);
	};
	IndexSidebar.prototype = {
		constructor: IndexSidebar,
		init (options) {
			var options = options || {};
			var defaultOptions = {
				indices: 'ABCDEFGHIJKLMNOPRSTUVWXYZ',
				mounted: document.body
			}
			for (var k in defaultOptions) {
				if(!options.hasOwnProperty(k)){
					options[k] = defaultOptions[k]
				}
			}
			// construct the dom structure and 
			var sidebarNode = document.createElement('div');
			options.indices.split('').forEach((elem, index) => {
				var indexNode = document.createElement('div');
				indexNode.innerHTML = elem;
				sidebarNode.appendChild(indexNode);
			})
			var indicator = document.createElement('div');
			indicator.classList.add('indicator');
			sidebarNode.appendChild(indicator)
			sidebarNode.classList.add('sideBar');
			options.mounted.appendChild(sidebarNode);
			// debugger
			// calculate each unit's height...
			this.unitHeight = sidebarNode.firstElementChild.getBoundingClientRect().height;
			this.nodeList = sidebarNode.childNodes;
			this.touchStart = {
				x:null,
				y:null
			};
			this.startElem = null;
			// listening to events...
			sidebarNode.addEventListener('touchstart', (e) => {
				this.touchstart(e);
			});
			sidebarNode.addEventListener('touchmove', (e) => {
				e.preventDefault();
				this.touchmove(e);
			});
			sidebarNode.addEventListener('touchend', (e) => {
				this.touchend(e);
			});
		},
		touchstart (e) {
			// debugger
			this.touchStart.x = e.touches[0].clientX;
			this.touchStart.y = e.touches[0].clientY;
			// store start elem's properties(node, position, index)
			// debugger
			this.startElem = {
				node: e.srcElement,
				top: e.srcElement.getBoundingClientRect().top,
				bottom: e.srcElement.getBoundingClientRect().bottom,
				getIndex () {
					var parent = this.node.parentNode, siblings = parent.childNodes, siblingsCount = siblings.length;
					for (var i = 0; i < siblingsCount; i ++) {
						if(siblings[i] === this.node)this.index = i;
					}
				},
				index: null
			};
			this.startElem.getIndex();
			// debugger
			emitter.trigger('fingerLand', e.srcElement)
		},
		touchmove (e) {
			var deltaY = (e.touches[0].pageY - this.touchStart.y);
			// console.log(deltaY)
			if (deltaY > this.startElem.bottom - this.touchStart.y) {
				var margin = this.startElem.bottom - this.touchStart.y;
				deltaY -= margin;
				var currentNodeIndex = ~~(deltaY / this.unitHeight) + 1;
				// 如果接触到新元素则记录并触发
				if (this.nodeIndex !== currentNodeIndex) {
					this.nodeIndex = currentNodeIndex;
					var currentNode = this.nodeList[this.startElem.index + currentNodeIndex]
					emitter.trigger('fingerLand', currentNode);
				}
			} else if (deltaY < this.startElem.top - this.touchStart.y) {
				var margin = this.touchStart.y - this.startElem.top;
				// debugger
				deltaY += margin;
				var currentNodeIndex = Math.abs(~~(deltaY / this.unitHeight)) + 1;
				if (this.nodeIndex !== currentNodeIndex) {
					this.nodeIndex = currentNodeIndex;
					var currentNode = this.nodeList[this.startElem.index - currentNodeIndex]
					emitter.trigger('fingerLand', currentNode);
				}
			} else {
				var currentNodeIndex = 0;
				if (this.nodeIndex !== currentNodeIndex) {
					this.nodeIndex = currentNodeIndex;
					var currentNode = this.nodeList[this.startElem.index]
					emitter.trigger('fingerLand', currentNode);
				}
			}
		},
		touchend (e) {
			this.touchStart.x = this.touchStart.y = this.startElem = null;
			// debugger
			emitter.trigger('fingerOff')
		}
	}
	window.indexSidebar1 = new IndexSidebar({
		mounted: document.querySelector('div.top')
	});
})()