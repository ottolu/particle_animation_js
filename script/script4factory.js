/**
 * The editor for
 * A simple particle animation
 *
 * @ Description
 * Just4Fun.
 * Much more useful than the earlier version.
 * 
 * @ Version   0.002
 * @ Author    Nomi
 * @ Date      2013/1/7
 * 
 */

;
(function(win, doc, undefined) {

	var _ = {

		extend: function(t, s, o) {
			if(o === undefined) o = false;
			for(var p in s) {
				if(!(p in t) || o) {
					t[p] = s[p];
				}
			}
			return t;
		},

		fn: function(t, s, o) {
			if(o === undefined) o = false;
			var prop = t.prototype;
			for(var p in s) {
				if(!(p in prop) || o) {
					prop[p] = s[p];
				}
			}
		},

		addEvent: function(o, e, f) {
			o.addEventListener ? o.addEventListener(e, f, false) : o.attachEvent('on' + e, function() {
				f.call(o);
			});
			return this;
		},

		$: function(id) {
			return typeof id === 'string' ? doc.getElementById(id) : id;
		},

		log: function(s) { !! window.console && console.log(s);
		}
	};

	var Point = function(x, y, color) {
			if(typeof color === 'undefined') {
				color = '#ccc';
			}

			this.x = x;
			this.y = y;
			this.color = color;

			this.toggle = false;
		};

	_.fn(Point, {
		create: function() {
			this.elem = doc.createElement('div');
			this.style = this.elem.style;
			this.style['position'] = 'absolute';
			this.style['background'] = this.color;

			this.setPos(this.x * 10, this.y * 10);

			return this.elem;
		},

		setPos: function(x, y) {
			this.style['left'] = x + 'px';
			this.style['top'] = y + 'px';
		},

		setColor: function(color) {
			this.toggle = true;
			this.color = color;
			this.style['background'] = color;
		},

		reset: function() {
			this.toggle = false;
			this.style['background'] = '#ccc';
		},

		clone: function() {
			return {
				x: this.x,
				y: this.y,
				color: this.color
			}
		}
	});

	var Factroy = {

		width: 130,
		height: 55,

		arr: [],
		stateList: [
			[]
		],

		did: [],
		didList: [],

		currentIndex: 0,

		setArray: function(x, y, value) {
			if(typeof this.arr[x] === 'undefined') {
				this.arr[x] = [];
			}
			if(typeof value === 'undefined') {
				delete this.arr[x][y];
			} else {
				this.arr[x][y] = value;
			}
		},

		getArray: function(x, y) {
			if(typeof this.arr[x] === 'undefined') return false;
			if(typeof this.arr[x][y] === 'undefined') return false;
			return this.arr[x][y];
		},

		init: function() {
			var fragment = doc.createDocumentFragment(); //创建文档碎片
			for(var i = 0; i < this.width; i++) {
				for(var j = 0; j < this.height; j++) {
					var node = new Point(i, j),
						ele = node.create();

					ele.myX = i;
					ele.myY = j;

					this.setArray(i, j, node);

					fragment.appendChild(ele);
				}
			}
			_.$('block').appendChild(fragment); //最后一次性添加到document中
		},

		rollback: function() {
			if(this.didList.length === 0) return;
			var list = this.didList.pop();

			for(var i = 0, l = list.length; i < l; i++) {
				var p = list[i];
				if(typeof p.color !== 'undefined') {
					this.getArray(p.x, p.y).setColor(p.color);
				} else {
					this.getArray(p.x, p.y).reset();
				}
			}
		},

		add2did: function(dx, dy, dcolor) {
			var obj = {
				x: dx,
				y: dy,
				color: dcolor
			};
			this.did.push(obj);
		},

		add2didList: function() {
			this.didList.push(this.did);
			this.did = [];
		},

		newPage: function() {
			this.stateList.push([]);
			_.log(this.stateList);
		},

		deletePage: function() {
			if(this.stateList.length === 1) return false;
			this.stateList.splice(this.currentIndex, 1);
			this.currentIndex--;
			if(this.currentIndex < 0) {
				this.currentIndex += this.stateList.length;
			}
			this.load(this.currentIndex);
			return true;
		},

		go2page: function(index) {
			if(index < 0) index += this.stateList.length;
			index %= this.stateList.length;
			if(index == this.currentIndex) return false;

			this.stateList[this.currentIndex] = this.save();
			this.load(index);

			this.currentIndex = index;

			_.log(this.currentIndex);
			_.log(this.stateList);

			return true;
		},

		save: function() {
			var array = [];
			for(var i = 0; i < Factroy.height; i++) {
				for(var j = 0; j < Factroy.width; j++) {
					var p = this.arr[j][i];
					if(p.toggle) {
						array.push(p.clone());
					}
				}
			}

			return array;
		},

		clear: function() {
			for(var i = 0; i < Factroy.height; i++) {
				for(var j = 0; j < Factroy.width; j++) {
					var p = F.getArray(j, i);
					if(p) {
						p.reset();
					}
				}
			}
		},

		load: function(index) {

			this.clear();

			var state = this.stateList[index];
			for(var i = 0, l = state.length; i < l; i++) {
				var p = state[i];
				this.arr[p.x][p.y].setColor(p.color);
			}

			this.did.length = 0;
			this.didList.length = 0;
		},

		arr2str: function(array) {
			var str = '[',
				num = 0;

			for(var i = 0, l = array.length; i < l; i++) {
				var p = array[i];
				str += '{x:' + p.x + ', y:' + p.y + ', color: "' + p.color + '"},';
				num++;
				if(num > 5) {
					num = 0;
					str += '<br/>';
				}
			}

			if(str.length > 1) {
				str = str.slice(0, -1) + ']';
				if(num === 0) {
					str = str.slice(0, -6) + ']';
				}
			} else {
				str = '';
			}

			_.log(str);

			return str;
		},

		outputState: function() {
			this.stateList[this.currentIndex] = this.save();

			var str = '//please copy all this text to replace the text in the data.js file:<br/><br/>var State = [];<br/><br/>',
				index = 0;

			for(var i = 0, l = this.stateList.length; i < l; i++) {
				var substr = this.arr2str(this.stateList[i]);
				if(substr.length !== 0) {
					str += 'State[' + index + '] = ' + substr + ';<br/><br/>';
				} else {
					str += 'State[' + index + '] = [];<br/><br/>';
				}
				index++;
			}

			return str;
		}

	};

	win._ = _;
	win.Factroy = win.F = Factroy;

})(window, document);

_.addEvent(window, 'load', function() {

	var color = '#ff0000',
		isWrite = true,
		isMousedown = false;

	Factroy.init();

	var toggle = function(x, y) {
			var p = F.getArray(x, y);
			if(!p) return;
			if(p.toggle) {
				F.add2did(x, y, p.color);
				p.reset();
			} else {
				p.setColor(color);
				F.add2did(x, y);
			}
		};

	var fill = function(x, y) {
			var p = F.getArray(x, y);
			if(p) {
				p.setColor(color);
			}
			F.add2did(x, y);
		};

	var ease = function(x, y) {
			var p = F.getArray(x, y);
			if(p) {
				F.add2did(x, y, p.color);
				p.reset();
			}
		};

	_.addEvent(_.$('block'), 'mouseup', function() {
		F.add2didList();
	}).addEvent(_.$('block'), 'mouseover', function(event) {

		if(isMousedown) {
			var ele = event.relatedTarget;
			if(isWrite) {
				fill(ele.myX, ele.myY);
			} else {
				ease(ele.myX, ele.myY);
			}
		}

	}).addEvent(window, 'mouseup', function() {

		isMousedown = false;

	}).addEvent(_.$('block'), 'mousedown', function(event) {

		isMousedown = true;
		var ele = event.srcElement;
		toggle(ele.myX, ele.myY);

	}).addEvent(_.$('submit'), 'click', function() {

		var str = F.outputState();
		_.$('output').innerHTML = str;

	}).addEvent(_.$('color'), 'keyup', function() {

		color = '#' + _.$('color').value;
		_.$('colorShow').style['background'] = color;

	}).addEvent(_.$('ease'), 'click', function() {
		isWrite = false;
	}).addEvent(_.$('write'), 'click', function() {
		isWrite = true;
	}).addEvent(_.$('clear'), 'click', function() {
		F.clear();
	}).addEvent(_.$('new'), 'click', function() {

		F.newPage();
		_.$('totalPage').innerHTML = F.stateList.length;

	}).addEvent(_.$('delete'), 'click', function() {

		if(F.deletePage()) {
			_.$('totalPage').innerHTML = F.stateList.length;
			_.$('lookPage').innerHTML = F.currentIndex + 1;
		} else {
			alert('只剩下一页,不能删除.');
		}

	}).addEvent(_.$('prev'), 'click', function() {

		if(F.go2page(F.currentIndex - 1)) {
			_.$('lookPage').innerHTML = F.currentIndex + 1;
		}

	}).addEvent(_.$('next'), 'click', function() {

		if(F.go2page(F.currentIndex + 1)) {
			_.$('lookPage').innerHTML = F.currentIndex + 1;
		}

	}).addEvent(_.$('undo'), 'click', function() {
		F.rollback();
	});
});