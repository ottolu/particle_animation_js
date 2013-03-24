/**
 * A simple particle animation
 *
 * @ Description
 * Just4Fun
 * 
 * @ Version 0.001
 * @ Author Nomi
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
		},

		$: function(id) {
			return typeof id === 'string' ? doc.getElementById(id) : id;
		},

		log: function(s) { !! window.console && console.log(s);
		}
	};

	var Point = function(x, y, speed, gravity, boundX, boundY) {
			this.x = x;
			this.y = y;
			this.initHeight = y;
			this.speed = speed;
			this.gravity = gravity;
			this.direction = Game.randBool() ? 1 : -1;
			this.boundX = boundX;
			this.boundY = boundY;
			this.dy = Game.rand(0, 10 * gravity);

			this.isstop = false;
		};

	_.fn(Point, {
		create: function() {
			this.elem = doc.createElement('div');
			this.style = this.elem.style;
			this.style['position'] = 'absolute';

			this.setColor('#ff0000');
			this.setPos(this.x, this.y);
		},

		setPos: function(x, y) {
			this.style['left'] = x + 'px';
			this.style['top'] = y + 'px';
		},

		setColor: function(color) {
			this.style['background'] = color;
		},

		// 越改越恶心的地方~ 特别最后两个修正
		move: function() {
			if (this.isstop) return;

			this.dy += this.gravity * this.direction;
			this.x = this.x + this.speed;
			this.y = this.y + this.dy * this.direction;

			if(this.y > this.boundY) {
				this.direction = -1;
				this.gravity = this.gravity * 1.1;
			}

			if(this.dy < 0) {
				this.direction = 1;
				//this.dy = 0;
			}

			// shit 1
			if (this.y > this.boundY && this.dy < 0) {
				this.gravity = 0;
				this.dy = 0;
				this.y = this.boundY;
			}

			// shit 2
			( (this.y > this.boundY) && (this.y < (this.boundY + 10)) ) && (this.y = this.boundY);

			this.setPos(this.x, this.y);
		},

		isOut: function() {
			if(this.x < -10 || this.x > this.boundX) {
				this.isstop = true;
				return true;
			}
			return false;
		}
	});

	var Game = {

		dom: {},
		points: [],
		recyclePoint: [],
		running: false,
		initialize: false,

		stateList : [],
		current: [],
		currentIndex: 0,

		setArray: function(x, y, value) {
			if (typeof this.current[x] === 'undefined') { this.current[x] = []; }
			if (typeof value === 'undefined') {
				delete this.current[x][y];
			} else {
				this.current[x][y] = value;
			}
		},

		getArray: function(x, y) {
			if (typeof this.current[x] === 'undefined') return false;
			if (typeof this.current[x][y] === 'undefined') return false;
			return this.current[x][y];
		},

		init: function() {
			this.dom = _.$('block');
			//this.createPoint2();
			this.stateList = State;
			this.initState();
			this.initialize = true;
		},

		stateChange: function(index) {
			if (index < 0) index += this.stateList.length;
			index %= this.stateList.length;
			if (index == this.currentIndex) return;

			var oldstate = this.stateList[this.currentIndex];
			for (var i = 0, l = oldstate.length; i < l; i++) {
				var obj = oldstate[i], x = obj.x, y = obj.y;
				if (this.getArray(x, y)) {
					this.points.push(this.getArray(x, y));
					this.setArray(x, y);
				}
			}

			var state = this.stateList[index], fragment = doc.createDocumentFragment();
			for (var i = 0, l = state.length; i < l; i++) {
				var obj = state[i], x = obj.x, y = obj.y, color = obj.color, speed = this.rand(5, 10) * ((this.randBool() && 1) || -1),
					gravity = this.rand(1, 4);
				var point = new Point(x * 10, y * 10, speed, gravity, 1300, 550);
				point.create();
				point.setColor(color);
				fragment.appendChild(point.elem);
				this.setArray(x, y, point);
			}
			this.dom.appendChild(fragment);

			this.currentIndex = index;
		},

		initState: function() {
			var state = this.stateList[0], fragment = doc.createDocumentFragment();
			for (var i = 0, l = state.length; i < l; i++) {
				var obj = state[i], x = obj.x, y = obj.y, color = obj.color, speed = this.rand(5, 10) * ((this.randBool() && 1) || -1),
					gravity = this.rand(1, 4);
				var point = new Point(x * 10, y * 10, speed, gravity, 1300, 550);
				point.create();
				fragment.appendChild(point.elem);
				this.setArray(x, y, point);
			}
			this.dom.appendChild(fragment);
		},

		animStart: function() {
			this.running = true;
			this.anim();
		},

		animStop: function() {
			this.running = false;
		},

		// just for test
		createPoint2: function() {
			for(var i = 0, l = 50; i < l; i++) {
				var x = this.rand(300, 1000),
					y = this.rand(50, 250),
					speed = this.rand(5, 10) * ((this.randBool() && 1) || -1),
					gravity = this.rand(1, 4);

				var point = new Point(x, y, speed, gravity, 1300, 550);
				point.create();
				this.dom.appendChild(point.elem);
				this.points.push(point);
			}
		},

		removePoint: function() {
			if (this.recyclePoint.length === 0) return;

			var i = this.recyclePoint.length;
			while (i < 0) {
				var point = this.points[this.recyclePoint[i]];
				this.points.splice(this.recyclePoint[i], 1);
				this.dom.removeChild(point.elem);
				i--;
			}
			this.recyclePoint.length = 0;
		},

		rand: function(min, max) {
			return (Math.random() * (max - min) + min) >> 0;
		},

		randBool: function() {
			return this.rand(0, 2) >= 1;
		},

		anim: function() {
			if(!this.running) return;
			this.tween();
			var self = this;
			setTimeout(function() {
				self.anim();
			}, 33);
		},

		tween: function() {

			for(var i = 0, l = this.points.length; i < l; i++) {
				this.points[i].move();

				if(this.points[i].isOut()) {
					this.recyclePoint.push(i);
				}
			}

			// 应该改改 没必要每frame都算
			try {
				this.removePoint();
			} catch(e) {
				//this.animStop();
				_.log(e);
			}
		}
	};

	win._ = _;
	win.Game = Game;

})(window, document);

_.addEvent(window, 'load', function() {
	Game.init();
	Game.animStart();

	var i = 0, len = Game.stateList.length;

	setTimeout(function() {
		if (i + 1 < len) {
			Game.stateChange(++i);
			setTimeout(arguments.callee, 5000);
		}
	}, 2000);
});