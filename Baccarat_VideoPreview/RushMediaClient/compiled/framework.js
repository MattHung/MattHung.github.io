CocosWidget = function () {
};
cc || (cc = function () {
});
cc.Node || (cc.Node = function () {
});
cc.Node.CanvasRenderCmd || (cc.Node.CanvasRenderCmd = function () {
});
window.cocos_framework = function () {
};
var Canvas2Image = function () {
	function a(a, b, d) {
		var c = a.width, f = a.height;
		void 0 == b && (b = c);
		void 0 == d && (d = f);
		var e = document.createElement("canvas"), g = e.getContext("2d");
		e.width = b;
		e.height = d;
		g.drawImage(a, 0, 0, c, f, 0, 0, b, d);
		return e
	}

	function b(a) {
		a = a.toLowerCase().replace(/jpg/i, "jpeg");
		return "image/" + a.match(/png|jpeg|bmp|gif/)[0]
	}

	function d(a) {
		if (!window.btoa)throw"btoa undefined";
		var b = "";
		if ("string" == typeof a)b = a; else for (var d = 0; d < a.length; d++)b += String.fromCharCode(a[d]);
		return btoa(b)
	}

	function c(a) {
		var b =
			a.width, d = a.height;
		return a.getContext("2d").getImageData(0, 0, b, d)
	}

	var f = function () {
		var a = document.createElement("canvas"), b = a.getContext("2d");
		return {canvas: !!b, imageData: !!b.getImageData, dataURL: !!a.toDataURL, btoa: !!window.btoa}
	}(), k = function (a) {
		var b = [], c = [], f = a.width, g = a.height;
		b.push(66);
		b.push(77);
		var e = f * g * 3 + 54;
		b.push(e % 256);
		e = Math.floor(e / 256);
		b.push(e % 256);
		e = Math.floor(e / 256);
		b.push(e % 256);
		e = Math.floor(e / 256);
		b.push(e % 256);
		b.push(0);
		b.push(0);
		b.push(0);
		b.push(0);
		b.push(54);
		b.push(0);
		b.push(0);
		b.push(0);
		c.push(40);
		c.push(0);
		c.push(0);
		c.push(0);
		e = f;
		c.push(e % 256);
		e = Math.floor(e / 256);
		c.push(e % 256);
		e = Math.floor(e / 256);
		c.push(e % 256);
		e = Math.floor(e / 256);
		c.push(e % 256);
		e = g;
		c.push(e % 256);
		e = Math.floor(e / 256);
		c.push(e % 256);
		e = Math.floor(e / 256);
		c.push(e % 256);
		e = Math.floor(e / 256);
		c.push(e % 256);
		c.push(1);
		c.push(0);
		c.push(24);
		c.push(0);
		c.push(0);
		c.push(0);
		c.push(0);
		c.push(0);
		e = f * g * 3;
		c.push(e % 256);
		e = Math.floor(e / 256);
		c.push(e % 256);
		e = Math.floor(e / 256);
		c.push(e % 256);
		e = Math.floor(e / 256);
		c.push(e % 256);
		for (e =
			     0; 16 > e; e++)c.push(0);
		e = (4 - 3 * f % 4) % 4;
		a = a.data;
		var k = "";
		do {
			for (var h = f * (g - 1) * 4, m = "", q = 0; q < f; q++)var r = 4 * q, m = m + String.fromCharCode(a[h + r + 2]), m = m + String.fromCharCode(a[h + r + 1]), m = m + String.fromCharCode(a[h + r]);
			for (h = 0; h < e; h++)m += String.fromCharCode(0);
			k += m
		} while (--g);
		return d(b.concat(c)) + d(k)
	}, g = function (d, g, h, l) {
		if (f.canvas && f.dataURL)if (void 0 == l && (l = "png"), l = b(l), /bmp/.test(l)) {
			l = c(a(d, g, h));
			var n = k(l);
			document.location.href = "data:image/octet-stream;base64," + n
		} else n = l, d = a(d, g, h), n = d.toDataURL(n), document.location.href =
			n.replace(l, "image/octet-stream")
	}, h = function (a, d, g, h) {
		if (f.canvas && f.dataURL)return void 0 == h && (h = "png"), h = b(h), /bmp/.test(h) ? (a = c(a), a = k(a), "data:image/bmp;base64," + a) : a = a.toDataURL(a, h, d, g)
	};
	return {
		saveAsImage: g, saveAsPNG: function (a, b, c) {
			return g(a, b, c, "png")
		}, saveAsJPEG: function (a, b, c) {
			return g(a, b, c, "jpeg")
		}, saveAsGIF: function (a, b, c) {
			return g(a, b, c, "gif")
		}, saveAsBMP: function (a, b, c) {
			return g(a, b, c, "bmp")
		}, convertToImage: h, convertToPNG: function (a, b, c) {
			return h(a, b, c, "png")
		}, convertToJPEG: function (a,
		                            b, c) {
			return h(a, b, c, "jpeg")
		}, convertToGIF: function (a, b, c) {
			return h(a, b, c, "gif")
		}, convertToBMP: function (a, b, c) {
			return h(a, b, c, "bmp")
		}
	}
}();
(function () {
	CocosWidget.DrawNodeCanvas = function () {
	};
	CocosWidget.DrawNodeCanvas.CanvasRenderCmd = function (a) {
		cc.Node.CanvasRenderCmd.call(this, a);
		this._needDraw = !0;
		this._blendFunc = this._drawColor = this._buffer = null
	};
	CocosWidget.DrawNodeCanvas.CanvasRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);
	CocosWidget.DrawNodeCanvas.CanvasRenderCmd.prototype.constructor = CocosWidget.DrawNodeCanvas.CanvasRenderCmd;
	cc.extend(CocosWidget.DrawNodeCanvas.CanvasRenderCmd.prototype, {
		rendering: function (a,
		                     b, d) {
			a = a || cc._renderContext;
			a.getContext();
			var c = this._node._displayedOpacity / 255;
			if (0 !== c) {
				a.setTransform(this._worldTransform, b, d);
				a.setGlobalAlpha(c);
				this._blendFunc && this._blendFunc.src === cc.SRC_ALPHA && this._blendFunc.dst === cc.ONE && a.setCompositeOperation("lighter");
				for (var c = this._buffer, f = 0, k = c.length; f < k; f++) {
					var g = c[f];
					switch (g.type) {
						case CocosWidget.DrawNode.TYPE_CANVAS:
							this._drawImage(a, g, b, d)
					}
				}
			}
		}, _drawImage: function (a, b, d, c) {
			a = a.getContext();
			sourcePoint = new cc.Point(0, 0);
			c *= b.lineHeight;
			a.drawImage(b.canvas, sourcePoint.x, -(sourcePoint.y + c), b.lineWidth * d, c)
		}
	})
})();
CocosWidget.DrawNode = cc.DrawNode.extend({
	ctor: function () {
		this._super()
	}, updateCanvasSource: function (a) {
		var b = new cc._DrawNodeElement(CocosWidget.DrawNode.TYPE_CANVAS);
		b.canvas = a;
		b.lineWidth = a.width;
		b.lineHeight = a.height;
		0 >= this._buffer.length ? this._buffer.push(b) : this._buffer[0] = b
	}, _createRenderCmd: function () {
		return new CocosWidget.DrawNodeCanvas.CanvasRenderCmd(this)
	}
});
CocosWidget.DrawNode.TYPE_CANVAS = 200;
eventRegister = cc.Class.extend({
	current_target: null, root_node: null, eventSender: null, ctor: function () {
		this.current_target = null;
		this.eventSender = []
	}, setRootNode: function (a) {
		this.root_node = a;
		this.registerEvent()
	}, registerMouseEvent: function (a, b, d, c, f, k) {
		var g = {};
		g.target = a;
		g.node = b;
		g.callback_mouseDown = d;
		g.callback_mouseUp = c;
		g.callback_mouseEnter = f;
		g.callback_mouseOver = k;
		this.eventSender.push(g);
		this.setTouchEvent(b)
	}, setTouchEvent: function (a) {
		if (cc.sys.capabilities.hasOwnProperty("touches")) {
			var b = cc.EventListener.create({
				event: cc.EventListener.TOUCH_ONE_BY_ONE,
				swallowTouches: !0, onTouchBegan: function (a, b) {
					this.onMouseMove(a.getLocation());
					return this.onMouseDown(a.getLocation())
				}.bind(this), onTouchMoved: function (a, b) {
					return this.onMouseMove(a.getLocation())
				}.bind(this), onTouchEnded: function (a, b) {
					return this.onMouseUp(a.getLocation())
				}.bind(this)
			});
			cc.eventManager.addListener(b, void 0 == a ? this.root_node : a)
		}
	}, setMouseEvent: function () {
		if (cc.sys.capabilities.hasOwnProperty("mouse")) {
			var a = cc.EventListener.create({
				event: cc.EventListener.MOUSE, swallowTouches: !0,
				onMouseDown: function (a) {
					return this.onMouseDown(new cc.Point(a.getLocationX(), a.getLocationY()))
				}.bind(this), onMouseMove: function (a) {
					return this.onMouseMove(new cc.Point(a.getLocationX(), a.getLocationY()))
				}.bind(this), onMouseUp: function (a) {
					return this.onMouseUp(new cc.Point(a.getLocationX(), a.getLocationY()))
				}.bind(this), onMouseScroll: function (a) {
				}.bind(this)
			});
			cc.eventManager.addListener(a, this.root_node)
		}
	}, onMouseMove: function (a) {
		for (var b = this.eventSender.length - 1; 0 <= b; b--)if (cc.rectContainsPoint(this.eventSender[b].node.getBoundingBox(),
				a) && !isSpriteTransparentInPoint(a) && void 0 != this.eventSender[b].node.isVisible && 0 != this.eventSender[b].node.isVisible())return this.eventSender[b] != this.current_target && (a.pixel = GetPixel(a), this.current_target = this.eventSender[b], this.eventSender[b].callback_mouseEnter && this.eventSender[b].callback_mouseEnter.call(this.current_target.target, this.eventSender[b].node, a)), this.current_target = this.eventSender[b], !0;
		this.current_target && this.current_target.callback_mouseOver && this.current_target.callback_mouseOver.call(this.current_target.target,
			this.current_target.node, a);
		this.current_target = null;
		return !1
	}, onMouseDown: function (a) {
		return this.current_target && (a.pixel = GetPixel(a), this.current_target.callback_mouseDown) ? (this.current_target.callback_mouseDown.call(this.current_target.target, this.current_target.node, a), !0) : !1
	}, onMouseUp: function (a) {
		return this.current_target && (a.pixel = GetPixel(a), this.current_target.callback_mouseUp) ? (this.current_target.callback_mouseUp.call(this.current_target.target, this.current_target.node, a), !0) : !1
	}, registerEvent: function () {
		this.setTouchEvent();
		this.setMouseEvent()
	}
});
CocosWidget.eventRegister = function () {
};
CocosWidget.eventRegister._instance = null;
CocosWidget.eventRegister.getInstance = function () {
	CocosWidget.eventRegister._instance || (CocosWidget.eventRegister._instance = new eventRegister);
	return CocosWidget.eventRegister._instance
};
function GetPixel(a) {
	return cc.sys.os == cc.sys.OS_IOS ? null : gameCanvasCtx.getImageData(gameCanvas.width / DesignedWidth * a.x, gameCanvas.height / DesignedHeight * (DesignedHeight - a.y), 1, 1).data.slice(0, 4)
}
function isSpriteTransparentInPoint(a) {
	a = GetPixel(a);
	return null == a ? !1 : 0 == a[3] ? !0 : !1
}
gameLayer = cc.Layer.extend({
	layer_res: null, root_node: null, ctor: function (a) {
		this._super();
		"string" == typeof a && (scenes.push(this), this.layer_res = ccs.load(a), this.root_node = this.layer_res.node, this.addChild(this.root_node));
		a instanceof cc.Node && (this.root_node = a)
	}, registerMouseEvent: function (a, b, d, c, f, k) {
		void 0 == k && (k = this);
		CocosWidget.eventRegister.getInstance().registerMouseEvent(k, a, b, d, c, f)
	}, getNode: function (a) {
		return CocosWidget.getNode(this.root_node, a)
	}, connectNode: function (a, b) {
		return CocosWidget.connectNode(a,
			b)
	}, setVisible: function (a) {
		this.root_node.setVisible(a)
	}
});
var scenes = [], gameScene = cc.Scene.extend({
	ctor: function (a) {
		this._super();
		scenes.push(this)
	}, onExit: function () {
		var a = scenes.indexOf(this);
		0 <= a && scenes.splice(a, 1)
	}
}), SceneManger = function () {
	function a() {
		return {
			findSpecifyScene: function (a) {
				for (var b = 0; b < scenes.length; b++)if (scenes[b]instanceof a)return scenes[b];
				return null
			}
		}
	}

	var b = null;
	return {
		getInstance: function () {
			b || (b = a());
			return b
		}
	}
}();
var gameCanvas = document.getElementById("gameCanvas"), gameCanvasCtx = gameCanvas.getContext("2d"), DesignedWidth = 1920, DesignedHeight = 1080, screenWidget = function () {
	function a() {
		return {
			adjustResolution: function () {
				var a = DesignedWidth, b = DesignedHeight, f = cc.visibleRect.width, k = cc.visibleRect.height, g = 1, h = 0, p = 0, g = f / a, t = b * g;
				if (t <= k)p = k - t; else if (g = k / b, h = a * g, h <= f)h = f - h; else throw Error("can't fit the screen!");
				cc.log("device width:" + f);
				cc.log("device height:" + k);
				cc.log("k:" + g + " x:" + h + " y:" + p);
				cc.view.setDesignResolutionSize(a +
					h / g, b + p / g, cc.ResolutionPolicy.EXACT_FIT)
			}, CheckMouseHitArea: function (a) {
				var b = (void 0).getCurrentTarget(), f = b.convertToNodeSpace((void 0).getLocation());
				b.getContentSize();
				return cc.rectContainsPoint(a, f) ? !0 : !1
			}, GetPixel: function (a) {
				data = gameCanvas.getContext("2d").getImageData(0, 0, 1, 1).data;
				color = new cc.Color([data[0], data[1], data[2]]);
				logger.log(data)
			}
		}
	}

	var b;
	return {
		getInstance: function () {
			b || (b = a());
			return b
		}
	}
}();
function image(a, b) {
	this.header = "";
	this.data = [];
	this.width = a;
	this.height = b
}
function getLittleEndianHex(a) {
	for (var b = [], d = 4; 0 < d; d--)b.push(String.fromCharCode(a & 255)), a >>= 8;
	return b.join("")
}
function setImageHeader(a) {
	var b = getLittleEndianHex(a.width * a.height), d = getLittleEndianHex(a.width), c = getLittleEndianHex(a.height);
	a.header = "BM" + b + "\x00\x00\x00\x006\x00\x00\x00(\x00\x00\x00" + d + c + "\u0001\x00 \x00\x00\x00\x00\x00\x00\x00\x00\x00\u0013\x0B\x00\x00\u0013\x0B\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00"
}
function flipImage(a) {
	for (var b = [], d = 0; d < a.width; d++)for (var c = 0; c < a.height; c++)b[(a.height - 1 - c) * a.width + d] = a.data[c * a.width + d];
	a.data = b
}
function background(a, b, d, c, f, k) {
	for (var g = d; g < d + f; g++)for (var h = b; h < b + c; h++)a.data[g * a.width + h] = k
}
function fillRectangle(a, b, d, c, f, k) {
	for (var g = d; g < d + f; g++)for (var h = b; h < b + c; h++)a.data[g * a.width + h] = h == b || g == d || g == d + f - 1 || h == b + c - 1 ? String.fromCharCode(204, 204, 204, 0) : k
}
function drawPixel(a, b, d, c) {
	fillRectangle(a, b, d, 10, 10, c)
}
function cGreen() {
	return String.fromCharCode(152, 255, 195, 0)
}
function cOrange() {
	return String.fromCharCode(12, 160, 232, 0)
}
function cRed() {
	return String.fromCharCode(0, 0, 255, 0)
}
function cBlue() {
	return String.fromCharCode(232, 12, 58, 0)
}
function cTurquoise() {
	return String.fromCharCode(232, 255, 13, 0)
}
function drawRoot(a) {
}
function drawImage() {
	var a = new image(90, 90);
	setImageHeader(a);
	fillRectangle(a, 0, 0, 90, 90, String.fromCharCode(255, 0, 0, 0));
	return void 0 != window.btoa ? "data:image/bmp;base64," + btoa(a.header + a.data.join("")) : "data:image/bmp;base64," + $.base64.encode(a.header + a.data.join(""))
};
CocosWidget.ListBox = ccui.ListView.extend({
	font_size: 15, ctor: function (a, b, d, c) {
		this._super();
		this.setDirection(ccui.ScrollView.DIR_VERTICAL);
		this.setTouchEnabled(!0);
		this.setBounceEnabled(!0);
		this.setClippingEnabled(!0);
		this.setAnchorPoint(0, 1);
		this.setSize(new cc.Size(d.width, d.height));
		this.setContentSize(cc.size(c.width, c.height));
		this.x = a;
		this.y = b;
		this.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
		this.setBackGroundColor(new cc.Color(154, 191, 223));
		this.setBackGroundColorOpacity(127);
		this.setGravity(ccui.ListView.GRAVITY_CENTER_VERTICAL)
	},
	setFontSize: function (a) {
		this.font_size = a;
		a = this.getItems();
		for (var b = 0; b < a.length; b++)a[b]instanceof ccui.Text && a[b].setFontSize(this.font_size)
	}, addTextItem: function (a) {
		var b = new ccui.Text;
		b.setText(a);
		b.setAnchorPoint(new cc.Point(0, 0));
		b.setFontSize(this.font_size);
		this.pushBackCustomItem(b);
		this.refreshView()
	}
});
CocosWidget.Animation = ccui.Class.extend({
	frames: [], targetSprite: null, ctor: function (a, b, d, c, f) {
		this.targetSprite = a;
		cc.spriteFrameCache.addSpriteFrames(b);
		f || (f = 100);
		for (a = 0; a <= f; a++)b = String.format("{0}{1}.{2}", d, a, c), (b = cc.spriteFrameCache.getSpriteFrame(b)) && this.frames.push(b);
		new cc.Animation([], .5)
	}, runForever: function (a) {
		a = new cc.Animation(this.frames, a);
		this.targetSprite.runAction(cc.repeatForever(cc.animate(a)))
	}, runOnce: function (a) {
		a = new cc.Animation(this.frames, a);
		this.targetSprite.runAction(cc.animate(a))
	},
	stop: function () {
		this.targetSprite.stopAllActions()
	}
});
function InvokeFunction(a, b) {
	for (var d = [].slice.call(arguments).splice(2), c = a.split("."), f = c.pop(), k = 0; k < c.length; k++)b = b[c[k]];
	if (b[f])return b[f].apply(b, d)
}
function getURLParameterByName(a) {
	a = a.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	a = (new RegExp("[\\?&]" + a + "=([^&#]*)")).exec(location.search);
	return null === a ? "" : decodeURIComponent(a[1].replace(/\+/g, " "))
}
String.format = function () {
	for (var a = arguments[0], b = 1; b < arguments.length; b++)a = a.replace(new RegExp("\\{" + (b - 1) + "\\}", "gm"), arguments[b]);
	return a
};
CocosWidget.getNode = function (a, b) {
	for (var d = b.split("/"), c = null, f = 0; f < d.length; f++)if ("" != d[f]) {
		var k = ccui.helper.seekWidgetByName(a, d[f]);
		k && (a = k, f == d.length - 1 && (c = a))
	}
	return c
};
CocosWidget.connectNode = function (a, b) {
	for (var d = a.getChildren(), c = 0; c < d.length; c++) {
		var f = d[c].getName();
		b[f] = d[c];
		CocosWidget.connectNode(d[c], b[f])
	}
};
