function e(e,t,i,s){var r,a=arguments.length,o=a<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(e,t,i,s);else for(var n=e.length-1;n>=0;n--)(r=e[n])&&(o=(a<3?r(o):a>3?r(t,i,o):r(t,i))||o);return a>3&&o&&Object.defineProperty(t,i,o),o}"function"==typeof SuppressedError&&SuppressedError;const t=globalThis,i=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),r=new WeakMap;let a=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(i&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=r.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&r.set(t,e))}return e}toString(){return this.cssText}};const o=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,i,s)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[s+1],e[0]);return new a(i,e,s)},n=i?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new a("string"==typeof e?e:e+"",void 0,s))(t)})(e):e,{is:l,defineProperty:c,getOwnPropertyDescriptor:d,getOwnPropertyNames:u,getOwnPropertySymbols:h,getPrototypeOf:m}=Object,p=globalThis,g=p.trustedTypes,_=g?g.emptyScript:"",f=p.reactiveElementPolyfillSupport,v=(e,t)=>e,y={toAttribute(e,t){switch(t){case Boolean:e=e?_:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},b=(e,t)=>!l(e,t),x={attribute:!0,type:String,converter:y,reflect:!1,useDefault:!1,hasChanged:b};Symbol.metadata??=Symbol("metadata"),p.litPropertyMetadata??=new WeakMap;let w=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=x){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(e,i,t);void 0!==s&&c(this.prototype,e,s)}}static getPropertyDescriptor(e,t,i){const{get:s,set:r}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:s,set(t){const a=s?.call(this);r?.call(this,t),this.requestUpdate(e,a,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??x}static _$Ei(){if(this.hasOwnProperty(v("elementProperties")))return;const e=m(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(v("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(v("properties"))){const e=this.properties,t=[...u(e),...h(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[t,i]of this.elementProperties){const e=this._$Eu(t,i);void 0!==e&&this._$Eh.set(e,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(n(e))}else void 0!==e&&t.push(n(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,s)=>{if(i)e.adoptedStyleSheets=s.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const i of s){const s=document.createElement("style"),r=t.litNonce;void 0!==r&&s.setAttribute("nonce",r),s.textContent=i.cssText,e.appendChild(s)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,i);if(void 0!==s&&!0===i.reflect){const r=(void 0!==i.converter?.toAttribute?i.converter:y).toAttribute(t,i.type);this._$Em=e,null==r?this.removeAttribute(s):this.setAttribute(s,r),this._$Em=null}}_$AK(e,t){const i=this.constructor,s=i._$Eh.get(e);if(void 0!==s&&this._$Em!==s){const e=i.getPropertyOptions(s),r="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:y;this._$Em=s;const a=r.fromAttribute(t,e.type);this[s]=a??this._$Ej?.get(s)??a,this._$Em=null}}requestUpdate(e,t,i){if(void 0!==e){const s=this.constructor,r=this[e];if(i??=s.getPropertyOptions(e),!((i.hasChanged??b)(r,t)||i.useDefault&&i.reflect&&r===this._$Ej?.get(e)&&!this.hasAttribute(s._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:s,wrapped:r},a){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==r||void 0!==a)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===s&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,s=this[t];!0!==e||this._$AL.has(t)||void 0===s||this.C(t,void 0,i,s)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};w.elementStyles=[],w.shadowRootOptions={mode:"open"},w[v("elementProperties")]=new Map,w[v("finalized")]=new Map,f?.({ReactiveElement:w}),(p.reactiveElementVersions??=[]).push("2.1.1");const T=globalThis,$=T.trustedTypes,S=$?$.createPolicy("lit-html",{createHTML:e=>e}):void 0,C="$lit$",A=`lit$${Math.random().toFixed(9).slice(2)}$`,D="?"+A,M=`<${D}>`,E=document,I=()=>E.createComment(""),N=e=>null===e||"object"!=typeof e&&"function"!=typeof e,k=Array.isArray,z="[ \t\n\f\r]",R=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,O=/-->/g,U=/>/g,P=RegExp(`>|${z}(?:([^\\s"'>=/]+)(${z}*=${z}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),H=/'/g,L=/"/g,F=/^(?:script|style|textarea|title)$/i,V=(e=>(t,...i)=>({_$litType$:e,strings:t,values:i}))(1),j=Symbol.for("lit-noChange"),W=Symbol.for("lit-nothing"),G=new WeakMap,B=E.createTreeWalker(E,129);function q(e,t){if(!k(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==S?S.createHTML(t):t}const Y=(e,t)=>{const i=e.length-1,s=[];let r,a=2===t?"<svg>":3===t?"<math>":"",o=R;for(let n=0;n<i;n++){const t=e[n];let i,l,c=-1,d=0;for(;d<t.length&&(o.lastIndex=d,l=o.exec(t),null!==l);)d=o.lastIndex,o===R?"!--"===l[1]?o=O:void 0!==l[1]?o=U:void 0!==l[2]?(F.test(l[2])&&(r=RegExp("</"+l[2],"g")),o=P):void 0!==l[3]&&(o=P):o===P?">"===l[0]?(o=r??R,c=-1):void 0===l[1]?c=-2:(c=o.lastIndex-l[2].length,i=l[1],o=void 0===l[3]?P:'"'===l[3]?L:H):o===L||o===H?o=P:o===O||o===U?o=R:(o=P,r=void 0);const u=o===P&&e[n+1].startsWith("/>")?" ":"";a+=o===R?t+M:c>=0?(s.push(i),t.slice(0,c)+C+t.slice(c)+A+u):t+A+(-2===c?n:u)}return[q(e,a+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),s]};class K{constructor({strings:e,_$litType$:t},i){let s;this.parts=[];let r=0,a=0;const o=e.length-1,n=this.parts,[l,c]=Y(e,t);if(this.el=K.createElement(l,i),B.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(s=B.nextNode())&&n.length<o;){if(1===s.nodeType){if(s.hasAttributes())for(const e of s.getAttributeNames())if(e.endsWith(C)){const t=c[a++],i=s.getAttribute(e).split(A),o=/([.?@])?(.*)/.exec(t);n.push({type:1,index:r,name:o[2],strings:i,ctor:"."===o[1]?ee:"?"===o[1]?te:"@"===o[1]?ie:Q}),s.removeAttribute(e)}else e.startsWith(A)&&(n.push({type:6,index:r}),s.removeAttribute(e));if(F.test(s.tagName)){const e=s.textContent.split(A),t=e.length-1;if(t>0){s.textContent=$?$.emptyScript:"";for(let i=0;i<t;i++)s.append(e[i],I()),B.nextNode(),n.push({type:2,index:++r});s.append(e[t],I())}}}else if(8===s.nodeType)if(s.data===D)n.push({type:2,index:r});else{let e=-1;for(;-1!==(e=s.data.indexOf(A,e+1));)n.push({type:7,index:r}),e+=A.length-1}r++}}static createElement(e,t){const i=E.createElement("template");return i.innerHTML=e,i}}function J(e,t,i=e,s){if(t===j)return t;let r=void 0!==s?i._$Co?.[s]:i._$Cl;const a=N(t)?void 0:t._$litDirective$;return r?.constructor!==a&&(r?._$AO?.(!1),void 0===a?r=void 0:(r=new a(e),r._$AT(e,i,s)),void 0!==s?(i._$Co??=[])[s]=r:i._$Cl=r),void 0!==r&&(t=J(e,r._$AS(e,t.values),r,s)),t}class Z{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,s=(e?.creationScope??E).importNode(t,!0);B.currentNode=s;let r=B.nextNode(),a=0,o=0,n=i[0];for(;void 0!==n;){if(a===n.index){let t;2===n.type?t=new X(r,r.nextSibling,this,e):1===n.type?t=new n.ctor(r,n.name,n.strings,this,e):6===n.type&&(t=new se(r,this,e)),this._$AV.push(t),n=i[++o]}a!==n?.index&&(r=B.nextNode(),a++)}return B.currentNode=E,s}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class X{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,s){this.type=2,this._$AH=W,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=J(this,e,t),N(e)?e===W||null==e||""===e?(this._$AH!==W&&this._$AR(),this._$AH=W):e!==this._$AH&&e!==j&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>k(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==W&&N(this._$AH)?this._$AA.nextSibling.data=e:this.T(E.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,s="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=K.createElement(q(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(t);else{const e=new Z(s,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=G.get(e.strings);return void 0===t&&G.set(e.strings,t=new K(e)),t}k(e){k(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,s=0;for(const r of e)s===t.length?t.push(i=new X(this.O(I()),this.O(I()),this,this.options)):i=t[s],i._$AI(r),s++;s<t.length&&(this._$AR(i&&i._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=e.nextSibling;e.remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class Q{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,s,r){this.type=1,this._$AH=W,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=r,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=W}_$AI(e,t=this,i,s){const r=this.strings;let a=!1;if(void 0===r)e=J(this,e,t,0),a=!N(e)||e!==this._$AH&&e!==j,a&&(this._$AH=e);else{const s=e;let o,n;for(e=r[0],o=0;o<r.length-1;o++)n=J(this,s[i+o],t,o),n===j&&(n=this._$AH[o]),a||=!N(n)||n!==this._$AH[o],n===W?e=W:e!==W&&(e+=(n??"")+r[o+1]),this._$AH[o]=n}a&&!s&&this.j(e)}j(e){e===W?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class ee extends Q{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===W?void 0:e}}class te extends Q{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==W)}}class ie extends Q{constructor(e,t,i,s,r){super(e,t,i,s,r),this.type=5}_$AI(e,t=this){if((e=J(this,e,t,0)??W)===j)return;const i=this._$AH,s=e===W&&i!==W||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,r=e!==W&&(i===W||s);s&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class se{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){J(this,e)}}const re=T.litHtmlPolyfillSupport;re?.(K,X),(T.litHtmlVersions??=[]).push("3.3.1");const ae=globalThis;let oe=class extends w{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const s=i?.renderBefore??t;let r=s._$litPart$;if(void 0===r){const e=i?.renderBefore??null;s._$litPart$=r=new X(t.insertBefore(I(),e),e,void 0,i??{})}return r._$AI(e),r})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return j}};oe._$litElement$=!0,oe.finalized=!0,ae.litElementHydrateSupport?.({LitElement:oe});const ne=ae.litElementPolyfillSupport;ne?.({LitElement:oe}),(ae.litElementVersions??=[]).push("4.2.1");const le={attribute:!0,type:String,converter:y,reflect:!1,hasChanged:b},ce=(e=le,t,i)=>{const{kind:s,metadata:r}=i;let a=globalThis.litPropertyMetadata.get(r);if(void 0===a&&globalThis.litPropertyMetadata.set(r,a=new Map),"setter"===s&&((e=Object.create(e)).wrapped=!0),a.set(i.name,e),"accessor"===s){const{name:s}=i;return{set(i){const r=t.get.call(this);t.set.call(this,i),this.requestUpdate(s,r,e)},init(t){return void 0!==t&&this.C(s,void 0,e,t),t}}}if("setter"===s){const{name:s}=i;return function(i){const r=this[s];t.call(this,i),this.requestUpdate(s,r,e)}}throw Error("Unsupported decorator location: "+s)};function de(e){return(t,i)=>"object"==typeof i?ce(e,t,i):((e,t,i)=>{const s=t.hasOwnProperty(i);return t.constructor.createProperty(i,e),s?Object.getOwnPropertyDescriptor(t,i):void 0})(e,t,i)}function ue(e){return de({...e,state:!0,attribute:!1})}class he{static getStandardTimerData(e,t,i){const s=t.state,r=t.attributes,a="active"===s,o="paused"===s,n="idle"===s;let l=0;r.duration&&(l=i(r.duration));let c=0,d=null;(a||o)&&(r.finishes_at?(d=new Date(r.finishes_at),isNaN(d.getTime())||(c=Math.max(0,Math.floor((d.getTime()-Date.now())/1e3)))):r.remaining&&(c=i(r.remaining)));let u=0;if(l>0)if(n)u=0;else{const e=l-c;u=Math.min(100,Math.max(0,e/l*100))}return{isActive:a,isPaused:o,duration:l,remaining:c,finishesAt:d,progress:u,isAlexaTimer:!1}}}class me{static getAlexaTimerData(e,t,i,s,r){var a,o,n,l,c,d,u,h,m;const{state:p,attributes:g}=t,_=null!==(a=this.parseJson(g.sorted_active))&&void 0!==a?a:[],f=null!==(o=this.parseJson(g.sorted_all))&&void 0!==o?o:[],v=null!==(l=null!==(n=g.total_active)&&void 0!==n?n:_.length)&&void 0!==l?l:0,y=null!==(d=null!==(c=g.total_all)&&void 0!==c?c:f.length)&&void 0!==d?d:0,b=new Map;for(const R of _){const e=this.extractTimerEntry(R);e&&b.set(e.id,e.data)}const x=new Map;for(const R of f){const e=this.extractTimerEntry(R);e&&x.set(e.id,e.data)}const w=Date.now();let T=this.alexaIdCache.get(e);T||(T={},this.alexaIdCache.set(e,T));const $=[];for(const[R,O]of b.entries()){const e="number"==typeof(null==O?void 0:O.triggerTime)?O.triggerTime:0;e&&e<=w&&$.push({id:R,trig:e})}$.length>0?($.sort((e,t)=>e.trig-t.trig),T.finishedWhileActiveId=$[0].id):T.finishedWhileActiveId&&!b.has(T.finishedWhileActiveId)&&delete T.finishedWhileActiveId;let S,C=!1,A=!1,D=!1,M=null;if(v>0&&_.length>0)if(T.finishedWhileActiveId&&b.has(T.finishedWhileActiveId))S=T.finishedWhileActiveId,M=null!==(u=b.get(S))&&void 0!==u?u:null,C=!!M,D=!0;else{if(1===_.length){const e=this.extractTimerEntry(_[0]);S=null==e?void 0:e.id,M=null!==(h=null==e?void 0:e.data)&&void 0!==h?h:null}else{let e,t=null,i=Number.POSITIVE_INFINITY;for(const s of _){const r=this.extractTimerEntry(s);r&&"number"==typeof(null===(m=r.data)||void 0===m?void 0:m.remainingTime)&&r.data.remainingTime<i&&(i=r.data.remainingTime,t=r.data,e=r.id)}S=e,M=t}C=!!M,C&&M&&"number"==typeof M.triggerTime&&M.triggerTime<=w&&(D=!0,T.finishedWhileActiveId=S)}else if(y>0&&f.length>0){let e=null,t=-1/0;for(const[i,s]of x.entries())if("PAUSED"===(null==s?void 0:s.status)){const r="number"==typeof s.lastUpdatedDate?s.lastUpdatedDate:-1/0;r>t&&(t=r,e=s,S=i)}e&&(M=e,A=!0)}let E=0,I=0,N=null,k=0;if(M){const e=Date.now(),t="number"==typeof M.remainingTime?M.remainingTime:0,i="number"==typeof M.originalDurationInMillis?M.originalDurationInMillis:0,s="number"==typeof M.triggerTime?M.triggerTime:0;if(I=Math.max(0,Math.floor(i/1e3)),C?(s&&s>e?(E=Math.max(0,Math.floor((s-e)/1e3)),N=new Date(s)):(E=Math.max(0,Math.floor(t/1e3)),E>0&&(N=new Date(e+1e3*E))),(s&&s<=e||E<=0||"OFF"===M.status&&0===t)&&(E=0,N=null,D=!0)):(E=Math.max(0,Math.floor(t/1e3)),N=null),I>0){const e=Math.max(0,I-E);k=Math.min(100,Math.max(0,e/I*100)),C&&k>=100&&(E=0,D=!0)}}else{if(p&&"unavailable"!==p&&"unknown"!==p&&(s(p)?(N=new Date(p),isNaN(N.getTime())||(E=Math.max(0,Math.floor((N.getTime()-Date.now())/1e3)))):isNaN(parseFloat(p))?"string"==typeof p&&p.includes(":")&&(E=r(p)):E=Math.max(0,parseFloat(p))),g.original_duration)I=r(g.original_duration);else if(g.duration)I=r(g.duration);else if(N&&t.last_changed){const e=new Date(t.last_changed).getTime(),i=N.getTime();!isNaN(e)&&i>e&&(I=Math.floor((i-e)/1e3))}if(I>0){const e=I-E;k=Math.min(100,Math.max(0,e/I*100))}}let z=this.extractTimerLabel(M);if(!z&&_.length>0){const e=this.extractTimerEntry(_[0]);z=this.extractTimerLabel(null==e?void 0:e.data)}if(!z&&f.length>0){const e=this.extractTimerEntry(f[0]);z=this.extractTimerLabel(null==e?void 0:e.data)}return{isActive:C,isPaused:A,duration:I,remaining:E,finishesAt:N,progress:k,finished:D,isAlexaTimer:!0,alexaDevice:this.extractAlexaDevice(e,g),timerLabel:null!=z?z:this.extractAlexaDevice(e,g),timerStatus:A?"PAUSED":C?"ON":"OFF",userDefinedLabel:z}}static parseLegacyAlexaTimer(e,t,i,s,r,a){let o=0,n=0,l=null,c=!1;if(i&&"unavailable"!==i&&"unknown"!==i)if(r(i)){if(l=new Date(i),!isNaN(l.getTime())){const e=Date.now();o=Math.max(0,Math.floor((l.getTime()-e)/1e3)),c=o>0}}else isNaN(parseFloat(i))?"string"==typeof i&&i.includes(":")&&(o=a(i),c=o>0):(o=Math.max(0,parseFloat(i)),c=o>0);let d=!1;if(s.original_duration)n=a(s.original_duration),d=!0;else if(s.duration)n=a(s.duration),d=!0;else if(l&&t.last_changed){const e=new Date(t.last_changed).getTime(),i=l.getTime();!isNaN(e)&&i>e&&(n=Math.floor((i-e)/1e3),d=!0)}d||(n=o>0?o:0,d=!1);let u=0;if(d&&n>0)if(c&&o>=0){const e=n-o;u=Math.min(100,Math.max(0,e/n*100))}else 0===o&&n>0&&(u=100);else if(c&&o>0){const e=t.last_changed?new Date(t.last_changed).getTime():Date.now(),i=(Date.now()-e)/1e3;if(i<o){const e=o+i,t=i;u=Math.min(100,Math.max(0,t/e*100))}else u=0}else u=0;return{isActive:c,isPaused:!1,duration:n,remaining:o,finishesAt:l,progress:u,isAlexaTimer:!0,alexaDevice:this.extractAlexaDevice(e,s),timerLabel:s.friendly_name||s.timer_label||this.formatAlexaTimerName(e),timerStatus:c?"ON":"OFF",userDefinedLabel:void 0}}static discoverAlexaTimers(e,t,i){var s,r;if(!e||!e.states)return[];const a=[];for(const o in e.states)if(t(o)){const t=e.states[o].attributes||{},n=null!==(s=this.parseJson(t.sorted_active))&&void 0!==s?s:[],l=null!==(r=this.parseJson(t.sorted_all))&&void 0!==r?r:[],c=Array.isArray(n)&&n.length>0;let d=!1;if(!c&&Array.isArray(l)&&l.length>0)for(const e of l){const t=this.extractTimerEntry(e),i=null==t?void 0:t.data;if(i&&"PAUSED"===i.status&&"number"==typeof i.remainingTime&&i.remainingTime>0){d=!0;break}}if(c||d){a.push(o);continue}const u=i(o,e);u&&(u.isActive||u.isPaused)&&a.push(o)}return a}static parseJson(e){if(Array.isArray(e))return e;if("string"==typeof e)try{return JSON.parse(e)}catch{}return null}static extractTimerEntry(e){return e&&"object"==typeof e&&!Array.isArray(e)&&e.id?{id:String(e.id),data:e}:Array.isArray(e)&&e.length>=2&&e[0]&&e[1]?{id:String(e[0]),data:e[1]}:null}static extractTimerLabel(e){if(e)return e.timerLabel?e.timerLabel:e.label?e.label:void 0}static extractAlexaDevice(e,t){if(t.friendly_name){let e=t.friendly_name;if(e=e.replace(/\s*next\s*timer$/i,"").replace(/\s*timer$/i,"").replace(/\s*echo\s*timer$/i,"").replace(/\s*alexa\s*timer$/i,"").trim(),e)return e}if(e.includes("_next_timer")){const t=e.replace(/^sensor\./,"").replace(/_next_timer$/,"").replace(/_/g," ").replace(/\b\w/g,e=>e.toUpperCase());if(t)return t}return t.device_name?t.device_name:t.device?t.device:"Alexa Device"}static formatAlexaTimerName(e){return e.replace(/^sensor\./,"").replace(/_next_timer$/,"").replace(/_timer$/,"").replace(/_/g," ").replace(/\b\w/g,e=>e.toUpperCase())}}me.alexaIdCache=new Map;class pe{static getGoogleTimerData(e,t,i,s){const{state:r,attributes:a}=t,o=a.timers||[];if(!Array.isArray(o)||0===o.length){const t=this.googleIdCache.get(e);return(null==t?void 0:t.finishedTimerId)&&(delete t.finishedTimerId,delete t.lastDuration,delete t.lastLabel),{isActive:!1,isPaused:!1,duration:0,remaining:0,finishesAt:null,progress:0,finished:!1,isGoogleTimer:!0,userDefinedLabel:void 0,googleTimerId:void 0,googleTimerStatus:"none"}}const n=new Map,l=new Map;for(const S of o)S.timer_id&&(l.set(String(S.timer_id),S),"set"!==S.status&&"ringing"!==S.status||n.set(String(S.timer_id),S));const c=Date.now()/1e3;let d=this.googleIdCache.get(e);d||(d={},this.googleIdCache.set(e,d));const u=[];for(const[S,C]of n.entries())C.fire_time&&C.fire_time<=c&&"ringing"!==C.status&&u.push({id:S,fireTime:C.fire_time,timer:C});for(const S of o)if(S.timer_id&&"ringing"===S.status){const e=String(S.timer_id),t=S.fire_time||c-1;u.push({id:e,fireTime:t,timer:S})}if(u.length>0){u.sort((e,t)=>t.fireTime-e.fireTime),d.finishedTimerId=u[0].id;const e=u[0].timer;e&&(d.lastDuration=e.duration||0,d.lastLabel=e.label||"Timer")}if(d.finishedTimerId){o.some(e=>String(e.timer_id)===d.finishedTimerId)||(delete d.finishedTimerId,delete d.lastDuration,delete d.lastLabel)}let h=null,m=null;for(const S of o)if(S.timer_id&&"ringing"===S.status)return{isActive:!1,isPaused:!1,duration:S.duration||0,remaining:0,finishesAt:null,progress:100,finished:!0,isGoogleTimer:!0,userDefinedLabel:S.label||void 0,googleTimerId:String(S.timer_id),googleTimerStatus:"ringing"};if(d.finishedTimerId&&l.has(d.finishedTimerId)){const e=l.get(d.finishedTimerId);if(e&&e.fire_time<=c)return{isActive:!1,isPaused:!1,duration:e.duration||0,remaining:0,finishesAt:null,progress:100,finished:!0,isGoogleTimer:!0,userDefinedLabel:e.label||void 0,googleTimerId:String(e.timer_id),googleTimerStatus:e.status||"ringing"}}let p=Number.POSITIVE_INFINITY;for(const[S,C]of n.entries())C.fire_time&&C.fire_time<p&&(p=C.fire_time,h=C,m=S);if(!h)for(const S of o)if(S.timer_id){if("paused"===String(S.status||"").toLowerCase().trim()){h=S,m=String(S.timer_id);break}}if(!h){if(!(o.length>0))return null;h=o[0],m=String(o[0].timer_id||"unknown")}const g=String(h.status||"").toLowerCase().trim(),_="set"===g||"ringing"===g,f="paused"===g,v="ringing"===g,y="number"==typeof h.duration?h.duration:s(h.duration||"0");let b=0,x=null,w=!1;d.pausedSnapshots||(d.pausedSnapshots=new Map);const T=d.pausedSnapshots.get(m);if(_){const e=h.fire_time?1e3*h.fire_time:0;e&&e>Date.now()?(b=Math.max(0,Math.floor((e-Date.now())/1e3)),x=new Date(e),d.pausedSnapshots.set(m,{remaining:b,pausedAt:c,wasActive:!0})):(b=0,x=null,w=!0)}else f?(b=T?T.remaining:y,d.pausedSnapshots.set(m,{remaining:b,pausedAt:c,wasActive:!1}),x=null):(b=0,x=null,w=!0);let $=0;if(y>0)if(v||w||0===b&&!f)$=100;else{const e=Math.max(0,y-b);$=Math.min(100,Math.max(0,e/y*100))}return w||(w=v||0===b&&!f),d.pausedSnapshots&&m&&(w||_)&&(_&&!1===(null==T?void 0:T.wasActive)||w)&&d.pausedSnapshots.delete(m),{isActive:_&&!v,isPaused:f,duration:y,remaining:b,finishesAt:x,progress:$,finished:w,isGoogleTimer:!0,userDefinedLabel:h.label||void 0,googleTimerId:m||void 0,googleTimerStatus:h.status}}static discoverGoogleTimers(e,t,i){if(!e||!e.states)return[];const s=[];for(const r in e.states)if(t(r)){const t=(e.states[r].attributes||{}).timers||[];if(Array.isArray(t)&&t.length>0){t.some(e=>{const t=String(e.status||"").toLowerCase().trim();return"set"===t||"ringing"===t||"paused"===t})&&s.push(r)}}return s}static clearFinishedTimer(e){const t=this.googleIdCache.get(e);t&&t.finishedTimerId&&(delete t.finishedTimerId,delete t.lastDuration,delete t.lastLabel)}}pe.googleIdCache=new Map;class ge{static isTimerEntity(e){return!!e&&(!!e.startsWith("timer.")||(!!(e.includes("_next_timer")||e.includes("alexa_timer")||e.startsWith("sensor.")&&e.includes("timer"))||(!(!e.startsWith("sensor.")||!e.endsWith("_timers"))||!(!e.includes("google_home")||!e.includes("timer")))))}static isAlexaTimer(e){return e.includes("_next_timer")||e.includes("alexa_timer")||e.startsWith("sensor.")&&e.includes("alexa")&&e.includes("timer")}static isGoogleTimer(e){return!(!e.startsWith("sensor.")||!e.endsWith("_timers"))||e.includes("google_home")&&e.includes("timer")}static getTimerData(e,t){if(!t||!e||!this.isTimerEntity(e))return null;const i=t.states[e];return i?this.isAlexaTimer(e)?me.getAlexaTimerData(e,i,t,this.isISOTimestamp,this.parseDuration):this.isGoogleTimer(e)?pe.getGoogleTimerData(e,i,t,this.parseDuration):he.getStandardTimerData(e,i,this.parseDuration):null}static discoverAlexaTimers(e){return me.discoverAlexaTimers(e,e=>this.isAlexaTimer(e),(e,t)=>this.getTimerData(e,t))}static discoverGoogleTimers(e){return pe.discoverGoogleTimers(e,e=>this.isGoogleTimer(e),(e,t)=>this.getTimerData(e,t))}static isISOTimestamp(e){return/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?([+-]\d{2}:\d{2}|Z)?$/.test(e)}static parseDuration(e){if("number"==typeof e)return e;if("string"!=typeof e)return 0;if(e.includes(":")){const t=e.split(":").map(Number);if(3===t.length)return 3600*t[0]+60*t[1]+t[2];if(2===t.length)return 60*t[0]+t[1]}const t=parseFloat(e);return isNaN(t)?0:t}static formatRemainingTime(e,t=!0,i,s=!0){if(e<=0)return"0:00";const r=Math.floor(e/3600),a=Math.floor(e%3600/60),o=Math.floor(e%60);if(s){const e=i?i("time.hour_compact"):"h",s=i?i("time.minute_compact"):"m",n=i?i("time.second_compact"):"s";return r>0?t?`${r}${e} ${a.toString().padStart(2,"0")}${s} ${o.toString().padStart(2,"0")}${n}`:`${r}${e} ${a.toString().padStart(2,"0")}${s}`:t?`${a}${s} ${o.toString().padStart(2,"0")}${n}`:`${a}${s}`}{const e=[];if(r>0){const t=i?i(1===r?"time.hour_full":"time.hours_full"):1===r?"hour":"hours";e.push(`${r} ${t}`)}if(a>0){const t=i?i(1===a?"time.minute_full":"time.minutes_full"):1===a?"minute":"minutes";e.push(`${a} ${t}`)}if(t&&o>0){const t=i?i(1===o?"time.second_full":"time.seconds_full"):1===o?"second":"seconds";e.push(`${o} ${t}`)}return 0===e.length?"0 "+(i?i("time.minutes_full"):"minutes"):e.join(" ")}}static getTimerTitle(e,t,i){if(i)return i;if(!t||!e)return"Timer";const s=t.states[e];if(!s)return"Timer";if(this.isAlexaTimer(e)){const i=me.getAlexaTimerData(e,s,t,this.isISOTimestamp,this.parseDuration);return(null==i?void 0:i.timerLabel)?i.timerLabel:this.formatAlexaTimerName(e)}if(this.isGoogleTimer(e)){const i=pe.getGoogleTimerData(e,s,t,this.parseDuration);return(null==i?void 0:i.userDefinedLabel)?i.userDefinedLabel:this.formatGoogleTimerName(e)}return s.attributes.friendly_name||e.replace("timer.","").replace(/_/g," ")}static formatAlexaTimerName(e){return e.replace(/^sensor\./,"").replace(/_next_timer$/,"").replace(/_timer$/,"").replace(/_/g," ").replace(/\b\w/g,e=>e.toUpperCase())}static formatGoogleTimerName(e){return e.replace(/^sensor\./,"").replace(/_timers$/,"").replace(/_/g," ").replace(/\b\w/g,e=>e.toUpperCase())+" Timers"}static isTimerExpired(e){return!!e&&(e.isAlexaTimer||e.isGoogleTimer?!!e.finished||0===e.remaining&&e.progress>=100:!e.isActive&&!e.isPaused&&e.progress>=100)}static getTimerSubtitle(e,t=!0,i,s=!0){if(!e)return"Timer not found";const r=i||(e=>e);if(e.isAlexaTimer){if(e.finished)return e.userDefinedLabel?r("timer.complete_with_label",{label:e.userDefinedLabel}):r("timer.complete");if(e.isActive&&e.remaining>0){const a=this.formatRemainingTime(e.remaining,t,i,s);return e.userDefinedLabel?r("timer.remaining_with_label",{time:a,label:e.userDefinedLabel}):e.alexaDevice?r("timer.remaining_with_device",{time:a,device:e.alexaDevice}):r("timer.remaining",{time:a})}if(e.isPaused&&e.remaining>0){const a=this.formatRemainingTime(e.remaining,t,i,s);return e.userDefinedLabel?r("timer.paused_with_time",{label:e.userDefinedLabel,time:a}):e.alexaDevice?r("timer.paused_alexa",{device:e.alexaDevice,time:a}):r("timer.paused_without_label",{time:a})}return e.finished||0===e.remaining&&e.progress>=100?e.userDefinedLabel?r("timer.complete_with_label",{label:e.userDefinedLabel}):r("timer.complete"):e.alexaDevice?r("timer.no_timers_device",{device:e.alexaDevice}):r("timer.no_timers")}if(e.isGoogleTimer){const a="ringing"===e.googleTimerStatus;if(e.finished||a)return e.userDefinedLabel?r("timer.complete_with_label",{label:e.userDefinedLabel}):r("timer.complete");if(e.isActive&&e.remaining>0){const a=this.formatRemainingTime(e.remaining,t,i,s);return e.userDefinedLabel?r("timer.remaining_with_label",{time:a,label:e.userDefinedLabel}):r("timer.remaining_with_device",{time:a,device:"Google Home"})}if(e.isPaused&&e.remaining>0){const a=this.formatRemainingTime(e.remaining,t,i,s);return e.userDefinedLabel?r("timer.paused_with_time",{label:e.userDefinedLabel,time:a}):r("timer.google_paused",{time:a})}return e.finished||a||0===e.remaining&&e.progress>=100?e.userDefinedLabel?r("timer.complete_with_label",{label:e.userDefinedLabel}):r("timer.complete"):r("timer.no_timers_google")}return e.isActive?r("timer.remaining",{time:this.formatRemainingTime(e.remaining,t,i,s)}):e.isPaused?r("timer.paused_time_left",{time:this.formatRemainingTime(e.remaining,t,i,s)}):e.duration>0?r("timer.ready_with_time",{time:this.formatRemainingTime(e.duration,t,i,s)}):r("timer.timer_ready")}static getTimerStateColor(e,t="#4caf50"){return e?e.isAlexaTimer?e.isActive&&e.remaining>0?"#00d4ff":this.isTimerExpired(e)?"#ff4444":"#888888":e.isGoogleTimer?e.isActive&&e.remaining>0?"#34a853":this.isTimerExpired(e)?"#ff4444":"#888888":e.isActive?"#4caf50":e.isPaused?"#ff9800":this.isTimerExpired(e)?"#f44336":"#9e9e9e":t}}class _e{static parseISODate(e){try{const t=this.parseISODateManual(e);if(!isNaN(t))return t}catch(i){}const t=new Date(e);return!isNaN(t.getTime())&&this.isValidDateResult(t,e)?t.getTime():this.parseISODateFallback(e)}static isValidDateResult(e,t){const i=e.getTime(),s=new Date("1970-01-01").getTime(),r=new Date("2100-12-31").getTime();if(i<s||i>r)return!1;if("string"==typeof t&&t.includes("02-29")){const t=e.getFullYear();if(!this.isLeapYear(t))return!1}return!0}static isLeapYear(e){return e%4==0&&e%100!=0||e%400==0}static parseISODateManual(e){if("string"==typeof e&&e.includes("T")){if(/[+-]\d{2}:\d{2}$|Z$/.test(e))return new Date(e).getTime();{const[t,i]=e.split("T"),[s,r,a]=t.split("-").map(Number);if(!this.isValidDateComponents(s,r,a))throw new Error("Invalid date components");if(i&&i.includes(":")){const[e,t,o]=i.split(":").map(parseFloat);if(!this.isValidTimeComponents(e,t,o))throw new Error("Invalid time components");return new Date(s,r-1,a,e,t,o||0).getTime()}return new Date(s,r-1,a).getTime()}}return new Date(e).getTime()}static isValidDateComponents(e,t,i){if(isNaN(e)||isNaN(t)||isNaN(i))return!1;if(e<1970||e>2100)return!1;if(t<1||t>12)return!1;if(i<1||i>31)return!1;return!(i>[31,this.isLeapYear(e)?29:28,31,30,31,30,31,31,30,31,30,31][t-1])}static isValidTimeComponents(e,t,i){const s=parseInt(e),r=parseInt(t),a=parseInt(i);return!(isNaN(s)||isNaN(r)||isNaN(a))&&(!(s<0||s>23)&&(!(r<0||r>59)&&!(a<0||a>59)))}static parseISODateFallback(e){try{const t=Date.parse(e);return isNaN(t)?Date.now():t}catch(t){return Date.now()}}}class fe{static validateConfig(e){const t=[];if(!e)return t.push({field:"config",message:"Configuration object is missing or empty",severity:"critical",suggestion:"Provide a valid configuration object with at least a target_date field.",value:e}),{isValid:!1,errors:t,hasCriticalErrors:!0,hasWarnings:!1};e.target_date?this.isValidDateInput(e.target_date)||t.push({field:"target_date",message:"Invalid target_date format",severity:"critical",suggestion:'Use ISO date string (2025-12-31T23:59:59), entity ID (sensor.my_date), or template ({{ states("sensor.date") }}).',value:e.target_date}):e.timer_entity||e.auto_discover_alexa||e.auto_discover_google||t.push({field:"target_date",message:'Either "target_date", "timer_entity", "auto_discover_alexa", or "auto_discover_google" must be provided',severity:"critical",suggestion:'Add target_date field with a valid date value like "2025-12-31T23:59:59" OR specify a timer_entity like "timer.my_timer" OR enable auto_discover_alexa OR enable auto_discover_google.',value:void 0}),e.timer_entity&&!this.isValidEntityId(e.timer_entity)&&t.push({field:"timer_entity",message:"Invalid timer_entity format",severity:"warning",suggestion:'Use a valid entity ID like "timer.my_timer", "sensor.alexa_timer", or "sensor.kitchen_display_timers" (Google Home).',value:e.timer_entity}),e.creation_date&&!this.isValidDateInput(e.creation_date)&&t.push({field:"creation_date",message:"Invalid creation_date format",severity:"warning",suggestion:"Use ISO date string, entity ID, or template. This field is optional.",value:e.creation_date});["text_color","background_color","progress_color"].forEach(i=>{e[i]&&!this.isValidColorInput(e[i])&&t.push({field:i,message:`Invalid ${i} format`,severity:"warning",suggestion:"Use hex (#ff0000), rgb/rgba, hsl/hsla, CSS color name, entity ID, or template.",value:e[i]})});["width","height","icon_size"].forEach(i=>{e[i]&&!this.isValidDimensionInput(e[i])&&t.push({field:i,message:`Invalid ${i} format`,severity:"warning",suggestion:"Use pixel values (100px), percentages (50%), or CSS units (2rem).",value:e[i]})}),e.aspect_ratio&&!this.isValidAspectRatioInput(e.aspect_ratio)&&t.push({field:"aspect_ratio",message:"Invalid aspect_ratio format",severity:"warning",suggestion:'Use format like "16/9", "4/3", or "1/1".',value:e.aspect_ratio}),void 0===e.stroke_width||this.isValidNumberInput(e.stroke_width,1,50)||t.push({field:"stroke_width",message:"Invalid stroke_width value",severity:"warning",suggestion:"Must be a number between 1 and 50.",value:e.stroke_width});["show_months","show_days","show_hours","show_minutes","show_seconds","expired_animation","show_progress_text"].forEach(i=>{void 0===e[i]||this.isValidBooleanInput(e[i])||t.push({field:i,message:`Invalid ${i} value`,severity:"warning",suggestion:"Must be true or false (boolean value).",value:e[i]})});["title","subtitle","expired_text"].forEach(i=>{e[i]&&!this.isValidTextInput(e[i])&&t.push({field:i,message:`Invalid ${i} - contains potentially unsafe content`,severity:"critical",suggestion:"Remove script tags, javascript: URLs, and event handlers for security.",value:e[i]})}),e.styles&&!this.isValidStylesInput(e.styles)&&t.push({field:"styles",message:"Invalid styles object structure",severity:"warning",suggestion:"Must contain valid style arrays for card, title, subtitle, or progress_circle.",value:e.styles}),this._addHelpfulValidations(e,t);const i=this._generateSafeConfig(e,t),s=t.filter(e=>"critical"===e.severity),r=t.filter(e=>"warning"===e.severity);return{isValid:0===s.length&&0===r.length,errors:t,hasCriticalErrors:s.length>0,hasWarnings:r.length>0,safeConfig:i}}static _addHelpfulValidations(e,t){}static _generateSafeConfig(e,t){const i={...e};return t.forEach(e=>{if("critical"===e.severity||"warning"===e.severity)switch(e.field){case"target_date":if(!(i.target_date||i.timer_entity||i.auto_discover_alexa||i.auto_discover_google)){const e=new Date;e.setDate(e.getDate()+1),i.target_date=e.toISOString()}break;case"background_color":this.isValidColorInput(i.background_color)||delete i.background_color;break;case"progress_color":this.isValidColorInput(i.progress_color)||(i.progress_color="#4caf50");break;case"stroke_width":this.isValidNumberInput(i.stroke_width,1,50)||(i.stroke_width=15);break;case"icon_size":this.isValidDimensionInput(i.icon_size)||(i.icon_size=100)}}),i}static validateConfigLegacy(e){const t=this.validateConfig(e);if(t.hasCriticalErrors){const e=t.errors.filter(e=>"critical"===e.severity);throw new Error(`Configuration validation failed:\n• ${e.map(e=>e.message).join("\n• ")}`)}}static isValidDateInput(e){if(!e)return!1;if(this.isTemplate(e))return!0;if("string"==typeof e&&e.includes("."))return!0;if("string"==typeof e)try{const t=new Date(e);return!isNaN(t.getTime())}catch(t){return!1}return!1}static isValidColorInput(e){if(!e)return!1;if(this.isTemplate(e)||"string"==typeof e&&e.includes("."))return!0;if("string"!=typeof e)return!1;if(/^#([0-9A-F]{3}){1,2}$/i.test(e))return!0;if(/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/i.test(e))return!0;if(/^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(,\s*[\d.]+\s*)?\)$/i.test(e))return!0;return["red","blue","green","yellow","orange","purple","pink","brown","black","white","gray","grey","cyan","magenta","lime","maroon","navy","olive","teal","silver","gold","indigo","violet","transparent","currentColor","inherit","initial","unset"].includes(e.toLowerCase())}static isValidDimensionInput(e){if(!e)return!1;if(this.isTemplate(e)||"string"==typeof e&&e.includes("."))return!0;if("number"==typeof e)return!0;if("string"!=typeof e)return!1;const t=e.match(/^(\d+(?:\.\d+)?)px$/i);if(t){const e=parseFloat(t[1]);return e>=0&&e<=1e4}const i=e.match(/^(\d+(?:\.\d+)?)%$/i);if(i){const e=parseFloat(i[1]);return e>=0&&e<=1e3}const s=["em","rem","vh","vw","vmin","vmax","ch","ex"];for(const r of s){const t=new RegExp(`^(\\d+(?:\\.\\d+)?)${r}$`,"i"),i=e.match(t);if(i){const e=parseFloat(i[1]);return e>=0&&e<=1e3}}return["auto","fit-content","min-content","max-content"].includes(e.toLowerCase())}static isValidAspectRatioInput(e){if(!e)return!1;if(this.isTemplate(e)||"string"==typeof e&&e.includes("."))return!0;if("string"!=typeof e)return!1;const t=e.match(/^(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);if(t){const e=parseFloat(t[1]),i=parseFloat(t[2]);return e>0&&i>0&&e<=20&&i<=20}return!1}static isValidNumberInput(e,t=-1/0,i=1/0){if(null==e)return!1;if("string"==typeof e){if(this.isTemplate(e)||e.includes("."))return!0;const s=parseFloat(e);return!isNaN(s)&&s>=t&&s<=i}return"number"==typeof e&&!isNaN(e)&&e>=t&&e<=i}static isValidBooleanInput(e){return"boolean"==typeof e}static isValidTextInput(e){if(!e)return!0;if(this.isTemplate(e)||"string"==typeof e&&e.includes("."))return!0;if("string"!=typeof e)return!1;return![/<script/i,/javascript:/i,/vbscript:/i,/on\w+\s*=/i,/<iframe/i,/<object/i,/<embed/i,/<form/i].some(t=>t.test(e))}static isValidStylesInput(e){if(!e||"object"!=typeof e)return!1;const t=["card","title","subtitle","progress_circle"],i=Object.keys(e);return!!i.every(e=>t.includes(e))&&i.every(t=>Array.isArray(e[t]))}static isTemplate(e){return"string"==typeof e&&e.includes("{{")&&e.includes("}}")}static isValidEntityId(e){if(!e||"string"!=typeof e)return!1;if(this.isTemplate(e))return!0;return/^[a-z_]+\.[a-z0-9_]+$/.test(e)}}const ve=new class{constructor(e){this._cache=new Map,this._expiration=e}get(e){return this._cache.get(e)}set(e,t){this._cache.set(e,t),this._expiration&&window.setTimeout(()=>this._cache.delete(e),this._expiration)}has(e){return this._cache.has(e)}delete(e){return this._cache.delete(e)}clear(){this._cache.clear()}}(6e4);class ye{constructor(){this._unsubRenderTemplates=new Map,this._templateResults=new Map,this._connected=!1}connect(){this._connected=!0,this._templateResults.forEach((e,t)=>{ve.has(t)&&this._templateResults.set(t,ve.get(t))})}async disconnect(){this._connected=!1,this._templateResults.forEach((e,t)=>{ve.set(t,e)});for(const[t,i]of this._unsubRenderTemplates.entries())try{(await i)()}catch(e){"not_found"!==e.code&&"template_error"!==e.code&&console.warn("[TimeFlow] Error unsubscribing from template:",e)}this._unsubRenderTemplates.clear()}async _subscribeToTemplate(e){var t,i,s;const r=null===(t=this.card)||void 0===t?void 0:t.hass;if(r&&r.connection&&this._connected&&!this._unsubRenderTemplates.has(e)){ve.has(e)&&this._templateResults.set(e,ve.get(e));try{const t=(a=r.connection,o=t=>{this._templateResults.set(e,t),ve.set(e,t),this.card&&this.card.requestUpdate&&this.card.requestUpdate()},n={template:e,variables:{user:null!==(s=null===(i=r.user)||void 0===i?void 0:i.name)&&void 0!==s?s:"User"},strict:!0},a.subscribeMessage(e=>o(e),{type:"render_template",...n}));this._unsubRenderTemplates.set(e,t),await t}catch(l){const t=this.extractFallbackFromTemplate(e);this._templateResults.set(e,{result:t,listeners:{all:!1,domains:[],entities:[],time:!1}}),this._unsubRenderTemplates.delete(e)}var a,o,n}}async unsubscribeFromTemplate(e){const t=this._unsubRenderTemplates.get(e);if(t)try{(await t)(),this._unsubRenderTemplates.delete(e),this._templateResults.delete(e)}catch(i){"not_found"!==i.code&&"template_error"!==i.code&&console.warn("[TimeFlow] Error unsubscribing from template:",i)}}async evaluateTemplate(e,t){var i,s;if(!e)return e;if(this._connected&&(null===(s=null===(i=this.card)||void 0===i?void 0:i.hass)||void 0===s?void 0:s.connection)&&await this._subscribeToTemplate(e),this._templateResults.has(e))return this._templateResults.get(e).result;if(ve.has(e)){const t=ve.get(e);return this._templateResults.set(e,t),t.result}return this.extractFallbackFromTemplate(e)}extractFallbackFromTemplate(e){if(!e||"string"!=typeof e)return e;try{const t=e.replace(/^\{\{\s*/,"").replace(/\s*\}\}$/,"").trim(),i=/^(.+?)\s+or\s+['"`]([^'"`]+)['"`]$/,s=t.match(i);if(s&&s[2])return s[2];const r=/^(.+?)\s+or\s+(.+?)\s+or\s+['"`]([^'"`]+)['"`]$/,a=t.match(r);if(a&&a[3])return a[3];const o=/^['"`]([^'"`]+)['"`]\s+if\s+(.+?)\s+else\s+['"`]([^'"`]+)['"`]$/,n=t.match(o);if(n&&n[3])return n[3];const l=/^(.+?)\s+if\s+(.+?)\s+else\s+['"`]([^'"`]+)['"`]$/,c=t.match(l);return c&&c[3]?c[3]:"Unavailable"}catch(t){return"Template Error"}}isTemplate(e){return"string"==typeof e&&e.includes("{{")&&e.includes("}}")}isValidTemplate(e){if(!e||"string"!=typeof e)return!1;if(!e.includes("{{")||!e.includes("}}"))return!1;if((e.match(/\{\{/g)||[]).length!==(e.match(/\}\}/g)||[]).length)return!1;return!!e.replace(/\{\{\s*/,"").replace(/\s*\}\}/,"").trim()}async resolveValue(e){var t,i;if(!e)return;if(this.isTemplate(e)){const i=(null===(t=this.card)||void 0===t?void 0:t.hass)||null;return await this.evaluateTemplate(e,i)||void 0}const s=null===(i=this.card)||void 0===i?void 0:i.hass;if("string"==typeof e&&e.includes(".")&&s&&s.states[e]){const t=s.states[e];if(!t)return;return t.state}return e}clearTemplateCache(){this.disconnect(),this._templateResults.clear()}hasTemplatesInConfig(e){if(!e)return!1;return["target_date","creation_date","title","subtitle","color","background_color","progress_color","primary_color","secondary_color"].some(t=>e[t]&&this.isTemplate(e[t]))}escapeHtml(e){return null==e||void 0===e?"":String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}}const be=1e3,xe=6e4,we=36e5,Te=864e5,$e=60,Se=3600;function Ce(e){if(e<=0)return{days:0,hours:0,minutes:0,seconds:0};return{days:Math.floor(e/Te),hours:Math.floor(e%Te/we),minutes:Math.floor(e%we/xe),seconds:Math.floor(e%xe/be)}}const Ae={eventy:{month:{singular:"MONTH",plural:"MONTHS"},day:{singular:"DAY",plural:"DAYS"},hour:{singular:"HOUR",plural:"HOURS"},minute:{singular:"MIN",plural:"MINS"},second:{singular:"SEC",plural:"SECS"}},mainDisplay:{month:{singular:"month left",plural:"months left"},day:{singular:"day left",plural:"days left"},hour:{singular:"hour left",plural:"hours left"},minute:{singular:"minute left",plural:"minutes left"},second:{singular:"second left",plural:"seconds left"}},timer:{month:{singular:"month",plural:"months"},day:{singular:"day",plural:"days"},hour:{singular:"hour",plural:"hours"},minute:{singular:"minute",plural:"minutes"},second:{singular:"second",plural:"seconds"}}};function De(e,t,i="mainDisplay"){const s=Ae[i][e];return 1===t?s.singular:s.plural}const Me={month:{singular:"time.month_eventy",plural:"time.months_eventy"},day:{singular:"time.day_eventy",plural:"time.days_eventy"},hour:{singular:"time.hour_eventy",plural:"time.hours_eventy"},minute:{singular:"time.minute_eventy",plural:"time.minutes_eventy"},second:{singular:"time.second_eventy",plural:"time.seconds_eventy"}};function Ee(e,t,i){if(!i)return De(e,t,"eventy");const s=Me[e];return i(1===t?s.singular:s.plural)}class Ie{constructor(e,t){this.templateService=e,this.dateParser=t,this.timeRemaining={months:0,days:0,hours:0,minutes:0,seconds:0,total:0},this.expired=!1,this.lastAlexaTimerData=null}_calculateCalendarMonths(e,t){if(t<=e)return{months:0,remainingMs:0};let i=0;const s=new Date(e);for(;;){const e=new Date(s);if(e.setMonth(e.getMonth()+1),!(e<=t))break;i++,s.setMonth(s.getMonth()+1)}return{months:i,remainingMs:t.getTime()-s.getTime()}}_findBestSmartTimer(e,t){if(e.timer_entity)return null;if(!e.auto_discover_alexa&&!e.auto_discover_google)return null;const i=[];if(e.auto_discover_alexa&&i.push(...ge.discoverAlexaTimers(t)),e.auto_discover_google&&i.push(...ge.discoverGoogleTimers(t)),0===i.length)return null;const s=[e=>e.isActive,e=>e.isPaused,e=>!!e.finished];for(const r of s){const e=i.find(e=>{const i=ge.getTimerData(e,t);return i&&r(i)});if(e){const i=ge.getTimerData(e,t);if(i)return{entityId:e,timerData:i}}}return null}async updateCountdown(e,t){try{if(e.timer_entity&&t){const i=ge.getTimerData(e.timer_entity,t);if(i)return this.timeRemaining=this._timerDataToCountdownState(i),this.expired=ge.isTimerExpired(i),this.timeRemaining}if(t){const i=this._findBestSmartTimer(e,t);if(i)return this.lastAlexaTimerData=i.timerData,this.timeRemaining=this._timerDataToCountdownState(i.timerData),this.expired=ge.isTimerExpired(i.timerData),this.timeRemaining;if(e.auto_discover_alexa||e.auto_discover_google)return this.lastAlexaTimerData&&ge.isTimerExpired(this.lastAlexaTimerData)?(this.timeRemaining=this._timerDataToCountdownState(this.lastAlexaTimerData),this.expired=!0,this.timeRemaining):(this.lastAlexaTimerData=null,this.timeRemaining={months:0,days:0,hours:0,minutes:0,seconds:0,total:0},this.expired=!1,this.timeRemaining)}if(!e.target_date)return this.timeRemaining;const i=(new Date).getTime(),s=await this.templateService.resolveValue(e.target_date);if(!s)return this.timeRemaining;const r=this.dateParser.parseISODate(s);if(isNaN(r))return this.timeRemaining;const a=r-i;if(a>0){const{show_months:t,show_days:s,show_hours:o,show_minutes:n,show_seconds:l}=e;let c=0,d=0,u=0,h=0,m=0,p=a;if(t){const e=new Date(i),t=new Date(r),s=this._calculateCalendarMonths(e,t);c=s.months,p=s.remainingMs}if(s)d=Math.floor(p/Te),p%=Te;else if(t&&!s){const e=new Date(i);e.setMonth(e.getMonth()+c);const t=new Date(r),s=this._calculateCalendarMonths(e,t);c+=s.months,p=s.remainingMs}if(o)u=Math.floor(p/we),p%=we;else if((t||s)&&!o){const e=Math.floor(p/we);s&&(d+=Math.floor(e/24)),p%=we}if(n)h=Math.floor(p/xe),p%=xe;else if((t||s||o)&&!n){const e=Math.floor(p/xe);o?u+=Math.floor(e/$e):s&&(d+=Math.floor(e/1440)),p%=xe}if(l)m=Math.floor(p/be);else if((t||s||o||n)&&!l){const e=Math.floor(p/be);n?h+=Math.floor(e/$e):o?u+=Math.floor(e/Se):s&&(d+=Math.floor(e/86400))}this.timeRemaining={months:c,days:d,hours:u,minutes:h,seconds:m,total:a},this.expired=!1}else this.timeRemaining={months:0,days:0,hours:0,minutes:0,seconds:0,total:0},this.expired=!0;return this.timeRemaining}catch(i){return this.timeRemaining}}async calculateProgress(e,t){if(e.timer_entity&&t){const i=ge.getTimerData(e.timer_entity,t);return i?i.progress:0}if(t){const i=this._findBestSmartTimer(e,t);if(i)return i.timerData.progress}const i=await this.templateService.resolveValue(e.target_date);if(!i)return 0;const s=this.dateParser.parseISODate(i),r=Date.now();let a;if(e.creation_date){const t=await this.templateService.resolveValue(e.creation_date);a=t?this.dateParser.parseISODate(t):r}else a=r;const o=s-a;if(o<=0)return 100;const n=r-a,l=Math.min(100,Math.max(0,n/o*100));return this.expired?100:l}getMainDisplay(e,t){if(e.timer_entity&&t){const i=ge.getTimerData(e.timer_entity,t);if(i){const{hours:e,minutes:t,seconds:s}=this.timeRemaining;return i.isAlexaTimer||i.isGoogleTimer?ge.isTimerExpired(i)?{value:"🔔",label:ge.getTimerSubtitle(i,!1)}:e>0?{value:e.toString(),label:De("hour",e,"mainDisplay")}:t>0?{value:t.toString(),label:De("minute",t,"mainDisplay")}:{value:s.toString(),label:De("second",s,"mainDisplay")}:e>0?{value:e.toString(),label:De("hour",e,"timer")}:t>0?{value:t.toString(),label:De("minute",t,"timer")}:{value:s.toString(),label:De("second",s,"timer")}}}if(t){const i=this._findBestSmartTimer(e,t);if(i){const{timerData:e}=i;this.lastAlexaTimerData=e,this.timeRemaining=this._timerDataToCountdownState(e);const{hours:t,minutes:s,seconds:r}=this.timeRemaining;return ge.isTimerExpired(e)?{value:"🔔",label:ge.getTimerSubtitle(e,!1)}:t>0?{value:t.toString(),label:De("hour",t,"mainDisplay")}:s>0?{value:s.toString(),label:De("minute",s,"mainDisplay")}:{value:r.toString(),label:De("second",r,"mainDisplay")}}if((e.auto_discover_alexa||e.auto_discover_google)&&this.lastAlexaTimerData&&ge.isTimerExpired(this.lastAlexaTimerData))return{value:"🔔",label:ge.getTimerSubtitle(this.lastAlexaTimerData,!1)}}const{show_months:i,show_days:s,show_hours:r,show_minutes:a,show_seconds:o}=e,{months:n,days:l,hours:c,minutes:d,seconds:u}=this.timeRemaining;return this.expired?e.auto_discover_alexa||e.auto_discover_google?this.lastAlexaTimerData?{value:"🔔",label:ge.getTimerSubtitle(this.lastAlexaTimerData,!1)}:{value:"🔔",label:"Timer complete"}:{value:"Done",label:"Completed!"}:i&&n>0?{value:n.toString(),label:De("month",n,"mainDisplay")}:s&&l>0?{value:l.toString(),label:De("day",l,"mainDisplay")}:r&&c>0?{value:c.toString(),label:De("hour",c,"mainDisplay")}:a&&d>0?{value:d.toString(),label:De("minute",d,"mainDisplay")}:o&&u>=0?{value:u.toString(),label:De("second",u,"mainDisplay")}:{value:"0",label:De("second",0,"mainDisplay")}}getSubtitle(e,t,i,s=!0){var r;const a=i||(e=>e);if(e.timer_entity&&t){const r=ge.getTimerData(e.timer_entity,t);return r?(r.isAlexaTimer||r.isGoogleTimer,ge.getTimerSubtitle(r,!1!==e.show_seconds,i,s)):"Timer not found"}if(t){const r=this._findBestSmartTimer(e,t);if(r){const{timerData:t}=r;return this.lastAlexaTimerData=t,this.timeRemaining=this._timerDataToCountdownState(t),ge.getTimerSubtitle(t,!1!==e.show_seconds,i,s)}if(e.auto_discover_alexa||e.auto_discover_google)return this.lastAlexaTimerData&&ge.isTimerExpired(this.lastAlexaTimerData)?ge.getTimerSubtitle(this.lastAlexaTimerData,!1!==e.show_seconds,i,s):a("timer.no_timers")}if(this.expired){const{expired_text:t=a("countdown.completed")}=e;return t}const{months:o,days:n,hours:l,minutes:c,seconds:d}=this.timeRemaining||{months:0,days:0,hours:0,minutes:0,seconds:0},{show_months:u,show_days:h,show_hours:m,show_minutes:p,show_seconds:g,compact_format:_,subtitle_prefix:f,subtitle_suffix:v}=e,y=[];u&&o>0&&y.push({value:o,unit:a(1===o?"time.month_full":"time.months_full")}),h&&n>0&&y.push({value:n,unit:a(1===n?"time.day_full":"time.days_full")}),m&&l>0&&y.push({value:l,unit:a(1===l?"time.hour_full":"time.hours_full")}),p&&c>0&&y.push({value:c,unit:a(1===c?"time.minute_full":"time.minutes_full")}),g&&d>0&&y.push({value:d,unit:a(1===d?"time.second_full":"time.seconds_full")});const b=e=>`${f?`${f} `:""}${e}${v?` ${v}`:""}`;if(0===y.length){const e=Ce((null===(r=this.timeRemaining)||void 0===r?void 0:r.total)||0);return e.hours>0?b(`${e.hours} ${1===e.hours?a("time.hour_full"):a("time.hours_full")}`):e.minutes>0?b(`${e.minutes} ${1===e.minutes?a("time.minute_full"):a("time.minutes_full")}`):e.seconds>0?b(`${e.seconds} ${1===e.seconds?a("time.second_full"):a("time.seconds_full")}`):g?b(`0 ${a("time.seconds_full")}`):a("countdown.starting")}if(1===y.length)return b(`${y[0].value} ${y[0].unit}`);if(!0===_||!1!==_&&y.length>=3){const e=y.map(e=>`${e.value}${e.unit.charAt(0)}`).join(" ");return b(e)}return b(y.map(e=>`${e.value} ${e.unit}`).join(" "))}_timerDataToCountdownState(e){const t=(i=e.remaining)<=0?{days:0,hours:0,minutes:0,seconds:0}:{days:Math.floor(i/86400),hours:Math.floor(i%86400/Se),minutes:Math.floor(i%Se/$e),seconds:Math.floor(i%$e)};var i;return{months:0,days:t.days,hours:t.hours,minutes:t.minutes,seconds:t.seconds,total:e.remaining*be}}getTimeRemaining(){return this.timeRemaining}isExpired(){return this.expired}getAvailableAlexaTimers(e){return e?ge.discoverAlexaTimers(e):[]}getAvailableGoogleTimers(e){return e?ge.discoverGoogleTimers(e):[]}getCurrentTimerEntity(e,t){if(e.timer_entity)return e.timer_entity;if((e.auto_discover_alexa||e.auto_discover_google)&&t){let i=[];if(e.auto_discover_alexa){const e=ge.discoverAlexaTimers(t);i.push(...e)}if(e.auto_discover_google){const e=ge.discoverGoogleTimers(t);i.push(...e)}if(i.length>0){for(const e of i){const i=ge.getTimerData(e,t);if(i&&i.isActive)return e}return i[0]}}return null}}class Ne{constructor(){this.cache={dynamicIconSize:null,dynamicStrokeWidth:null,customStyles:null,lastConfigHash:null}}processStyles(e){return e&&Array.isArray(e)?e.map(e=>{try{return"string"==typeof e?e:"object"==typeof e&&null!==e?Object.entries(e).map(([e,t])=>`${e}: ${t}`).join("; "):""}catch(t){return""}}).join("; "):""}buildStylesObject(e){const t=JSON.stringify(e.styles||{});if(null!==this.cache.customStyles&&this.cache.lastConfigHash===t)return this.cache.customStyles;const{styles:i={}}=e;try{const e={card:this.processStyles(i.card),title:this.processStyles(i.title),subtitle:this.processStyles(i.subtitle),progress_circle:this.processStyles(i.progress_circle)};return this.cache.customStyles=e,this.cache.lastConfigHash=t,e}catch(s){return this.cache.customStyles={card:"",title:"",subtitle:"",progress_circle:""},this.cache.customStyles}}_getCardDimensions(e,t,i){const s=300,r=150;let a=s,o=r;if(e&&t){a=this.parseDimension(e)||s,o=this.parseDimension(t)||r}else if(e&&i){a=this.parseDimension(e)||s;const[t,r]=i.split("/").map(parseFloat);!isNaN(t)&&!isNaN(r)&&t>0&&(o=a*(r/t))}else if(t&&i){o=this.parseDimension(t)||r;const[e,s]=i.split("/").map(parseFloat);!isNaN(e)&&!isNaN(s)&&s>0&&(a=o*(e/s))}else if(i){const[e,t]=i.split("/").map(parseFloat);!isNaN(e)&&!isNaN(t)&&e>0&&(o=s*(t/e)),a=s}return(!a||isNaN(a)||a<=0)&&(a=s),(!o||isNaN(o)||o<=0)&&(o=r),{cardWidth:a,cardHeight:o}}calculateDynamicIconSize(e,t,i,s){const r=JSON.stringify({width:e,height:t,aspect_ratio:i,icon_size:s});if(null!==this.cache.dynamicIconSize&&this.cache.lastIconConfigHash===r)return this.cache.dynamicIconSize;try{const{cardWidth:a,cardHeight:o}=this._getCardDimensions(e,t,i),n=.4*Math.min(a,o);let l=n;if(s&&"100px"!==s){const e="string"==typeof s?parseInt(s.replace("px","")):"number"==typeof s?s:n;l=isNaN(e)?n:e}return this.cache.dynamicIconSize=Math.max(Ne.MIN_ICON_SIZE,Math.min(l,Ne.MAX_ICON_SIZE)),this.cache.lastIconConfigHash=r,this.cache.dynamicIconSize}catch(a){return this.cache.dynamicIconSize=Ne.MIN_ICON_SIZE,this.cache.dynamicIconSize}}calculateDynamicStrokeWidth(e,t){const i=JSON.stringify({iconSize:e,stroke_width:t});if(null!==this.cache.dynamicStrokeWidth&&this.cache.lastStrokeConfigHash===i)return this.cache.dynamicStrokeWidth;try{if(t&&"number"==typeof t)this.cache.dynamicStrokeWidth=Math.max(Ne.MIN_STROKE,Math.min(t,Ne.MAX_STROKE));else{const t=.15,i=Math.round(e*t);this.cache.dynamicStrokeWidth=Math.max(Ne.MIN_STROKE,Math.min(i,Ne.MAX_STROKE))}return this.cache.lastStrokeConfigHash=i,this.cache.dynamicStrokeWidth}catch(s){return this.cache.dynamicStrokeWidth=Ne.MIN_STROKE,this.cache.dynamicStrokeWidth}}calculateProportionalSizes(e,t,i){try{const{cardWidth:s,cardHeight:r}=this._getCardDimensions(e,t,i),a=45e3,o=Math.sqrt(s*r/a);return{titleSize:Math.max(1.2,Math.min(2.2,1.6*o)),subtitleSize:Math.max(.9,Math.min(1.4,1.1*o)),cardWidth:s,cardHeight:r}}catch(s){return{titleSize:1.6,subtitleSize:1.1,cardWidth:300,cardHeight:150}}}parseDimension(e){try{if("number"==typeof e)return e;if("string"!=typeof e)return null;const t=e.toLowerCase();if(t.includes("%")){const e=parseFloat(t.replace("%",""));return isNaN(e)?null:e/100*300}if(t.includes("px")){const e=parseFloat(t.replace("px",""));return isNaN(e)?null:e}const i=parseFloat(t);return isNaN(i)?null:i}catch(t){return null}}generateCardDimensionStyles(e,t,i){const s=[];if(e){const t=this._formatDimensionValue(e);t&&s.push(`width: ${t}`)}if(t){const e=this._formatDimensionValue(t);e&&s.push(`height: ${e}`)}else i&&!t&&s.push(`aspect-ratio: ${i}`);return t||i||s.push("min-height: 120px"),s}_formatDimensionValue(e){if(!e)return null;const t=String(e).trim();if(/^[\d.]+\s*(px|%|em|rem|vh|vw|vmin|vmax|ch|ex)$/i.test(t))return t;const i=parseFloat(t);return isNaN(i)?null:`${i}px`}clearCache(){this.cache={dynamicIconSize:null,dynamicStrokeWidth:null,customStyles:null,lastConfigHash:null}}getCardDimensions(e,t,i){return this._getCardDimensions(e,t,i)}}Ne.MIN_ICON_SIZE=40,Ne.MAX_ICON_SIZE=300,Ne.MIN_STROKE=4,Ne.MAX_STROKE=50;const ke={en:{timer:{complete:"Timer complete",complete_with_label:"{label} timer complete",paused:"Paused",paused_with_time:"{label} timer paused - {time} left",paused_without_label:"Timer paused - {time} left",paused_alexa:"Timer paused on {device} - {time} left",ready:"Ready",ready_with_time:"Ready - {time}",no_timers:"No timers",no_timers_device:"No timers on {device}",no_timers_google:"No Google Home timers",remaining:"{time} remaining",remaining_with_label:"{time} remaining on {label} timer",remaining_with_device:"{time} remaining on {device}",paused_time_left:"Timer paused - {time} left",google_paused:"Google Home timer paused - {time} left",timer_ready:"Timer ready"},countdown:{starting:"Starting...",completed:"Completed!"},time:{hour_compact:"h",day_compact:"d",month_compact:"mo",minute_compact:"m",second_compact:"s",hour_full:"hour",hours_full:"hours",day_full:"day",days_full:"days",month_full:"month",months_full:"months",minute_full:"minute",minutes_full:"minutes",second_full:"second",seconds_full:"seconds",month_eventy:"MONTH",months_eventy:"MONTHS",day_eventy:"DAY",days_eventy:"DAYS",hour_eventy:"HOUR",hours_eventy:"HOURS",minute_eventy:"MIN",minutes_eventy:"MINS",second_eventy:"SEC",seconds_eventy:"SECS"}},fr:{timer:{complete:"Minuteur terminé",complete_with_label:"Minuteur {label} terminé",paused:"En pause",paused_with_time:"Minuteur {label} en pause - {time} restant",paused_without_label:"Minuteur en pause - {time} restant",paused_alexa:"Minuteur en pause sur {device} - {time} restant",ready:"Prêt",ready_with_time:"Prêt - {time}",no_timers:"Aucun minuteur",no_timers_device:"Aucun minuteur sur {device}",no_timers_google:"Aucun minuteur Google Home",remaining:"{time} restant",remaining_with_label:"{time} restant sur le minuteur {label}",remaining_with_device:"{time} restant sur {device}",paused_time_left:"Minuteur en pause - {time} restant",google_paused:"Minuteur Google Home en pause - {time} restant",timer_ready:"Minuteur prêt"},countdown:{starting:"Démarrage...",completed:"Terminé!"},time:{hour_compact:"h",day_compact:"j",month_compact:"mo",minute_compact:"min",second_compact:"s",hour_full:"heure",hours_full:"heures",day_full:"jour",days_full:"jours",month_full:"mois",months_full:"mois",minute_full:"minute",minutes_full:"minutes",second_full:"seconde",seconds_full:"secondes",month_eventy:"MOIS",months_eventy:"MOIS",day_eventy:"JOUR",days_eventy:"JOURS",hour_eventy:"HEURE",hours_eventy:"HEURES",minute_eventy:"MIN",minutes_eventy:"MINS",second_eventy:"SEC",seconds_eventy:"SECS"}},de:{timer:{complete:"Timer abgelaufen",complete_with_label:"Timer {label} abgelaufen",paused:"Pausiert",paused_with_time:"Timer {label} pausiert - {time} verbleibend",paused_without_label:"Timer pausiert - {time} verbleibend",paused_alexa:"Timer pausiert auf {device} - {time} verbleibend",ready:"Bereit",ready_with_time:"Bereit - {time}",no_timers:"Keine Timer",no_timers_device:"Keine Timer auf {device}",no_timers_google:"Keine Google Home Timer",remaining:"{time} verbleibend",remaining_with_label:"{time} verbleibend bei Timer {label}",remaining_with_device:"{time} verbleibend auf {device}",paused_time_left:"Timer pausiert - {time} verbleibend",google_paused:"Google Home Timer pausiert - {time} verbleibend",timer_ready:"Timer bereit"},countdown:{starting:"Startet...",completed:"Abgeschlossen!"},time:{hour_compact:"Std",day_compact:"T",month_compact:"Mon",minute_compact:"Min",second_compact:"s",hour_full:"Stunde",hours_full:"Stunden",day_full:"Tag",days_full:"Tage",month_full:"Monat",months_full:"Monate",minute_full:"Minute",minutes_full:"Minuten",second_full:"Sekunde",seconds_full:"Sekunden",month_eventy:"MONAT",months_eventy:"MONATE",day_eventy:"TAG",days_eventy:"TAGE",hour_eventy:"STD",hours_eventy:"STD",minute_eventy:"MIN",minutes_eventy:"MIN",second_eventy:"SEK",seconds_eventy:"SEK"}},es:{timer:{complete:"Temporizador finalizado",complete_with_label:"Temporizador {label} finalizado",paused:"Pausado",paused_with_time:"Temporizador {label} pausado - {time} restante",paused_without_label:"Temporizador pausado - {time} restante",paused_alexa:"Temporizador pausado en {device} - {time} restante",ready:"Listo",ready_with_time:"Listo - {time}",no_timers:"Sin temporizadores",no_timers_device:"Sin temporizadores en {device}",no_timers_google:"Sin temporizadores de Google Home",remaining:"{time} restante",remaining_with_label:"{time} restante en temporizador {label}",remaining_with_device:"{time} restante en {device}",paused_time_left:"Temporizador pausado - {time} restante",google_paused:"Temporizador de Google Home pausado - {time} restante",timer_ready:"Temporizador listo"},countdown:{starting:"Iniciando...",completed:"¡Completado!"},time:{hour_compact:"h",day_compact:"d",month_compact:"mes",minute_compact:"min",second_compact:"s",hour_full:"hora",hours_full:"horas",day_full:"día",days_full:"días",month_full:"mes",months_full:"meses",minute_full:"minuto",minutes_full:"minutos",second_full:"segundo",seconds_full:"segundos",month_eventy:"MES",months_eventy:"MESES",day_eventy:"DÍA",days_eventy:"DÍAS",hour_eventy:"HORA",hours_eventy:"HORAS",minute_eventy:"MIN",minutes_eventy:"MINS",second_eventy:"SEG",seconds_eventy:"SEGS"}},it:{timer:{complete:"Timer completato",complete_with_label:"Timer {label} completato",paused:"In pausa",paused_with_time:"Timer {label} in pausa - {time} rimanente",paused_without_label:"Timer in pausa - {time} rimanente",paused_alexa:"Timer in pausa su {device} - {time} rimanente",ready:"Pronto",ready_with_time:"Pronto - {time}",no_timers:"Nessun timer",no_timers_device:"Nessun timer su {device}",no_timers_google:"Nessun timer Google Home",remaining:"{time} rimanente",remaining_with_label:"{time} rimanente sul timer {label}",remaining_with_device:"{time} rimanente su {device}",paused_time_left:"Timer in pausa - {time} rimanente",google_paused:"Timer Google Home in pausa - {time} rimanente",timer_ready:"Timer pronto"},countdown:{starting:"Avvio...",completed:"Completato!"},time:{hour_compact:"h",day_compact:"g",month_compact:"mo",minute_compact:"min",second_compact:"s",hour_full:"ora",hours_full:"ore",day_full:"giorno",days_full:"giorni",month_full:"mese",months_full:"mesi",minute_full:"minuto",minutes_full:"minuti",second_full:"secondo",seconds_full:"secondi",month_eventy:"MESE",months_eventy:"MESI",day_eventy:"GIORNO",days_eventy:"GIORNI",hour_eventy:"ORA",hours_eventy:"ORE",minute_eventy:"MIN",minutes_eventy:"MIN",second_eventy:"SEC",seconds_eventy:"SEC"}},nl:{timer:{complete:"Timer klaar",complete_with_label:"Timer {label} klaar",paused:"Gepauzeerd",paused_with_time:"Timer {label} gepauzeerd - {time} resterend",paused_without_label:"Timer gepauzeerd - {time} resterend",paused_alexa:"Timer gepauzeerd op {device} - {time} resterend",ready:"Klaar",ready_with_time:"Klaar - {time}",no_timers:"Geen timers",no_timers_device:"Geen timers op {device}",no_timers_google:"Geen Google Home timers",remaining:"{time} resterend",remaining_with_label:"{time} resterend op timer {label}",remaining_with_device:"{time} resterend op {device}",paused_time_left:"Timer gepauzeerd - {time} resterend",google_paused:"Google Home timer gepauzeerd - {time} resterend",timer_ready:"Timer klaar"},countdown:{starting:"Starten...",completed:"Voltooid!"},time:{hour_compact:"u",day_compact:"d",month_compact:"mnd",minute_compact:"min",second_compact:"s",hour_full:"uur",hours_full:"uren",day_full:"dag",days_full:"dagen",month_full:"maand",months_full:"maanden",minute_full:"minuut",minutes_full:"minuten",second_full:"seconde",seconds_full:"seconden",month_eventy:"MAAND",months_eventy:"MAANDEN",day_eventy:"DAG",days_eventy:"DAGEN",hour_eventy:"UUR",hours_eventy:"UREN",minute_eventy:"MIN",minutes_eventy:"MIN",second_eventy:"SEC",seconds_eventy:"SEC"}}};function ze(e,t){try{const i=e.split(".");let s=ke[t];if(!s)return;for(const e of i)if(s=s[e],void 0===s)return;return"string"==typeof s?s:void 0}catch(U){return}}function Re(e){return function(t,i={}){var s,r;let a=ze(t,null!==(r=null===(s=null==e?void 0:e.locale)||void 0===s?void 0:s.language)&&void 0!==r?r:"en");return a||(a=ze(t,"en")),a?function(e,t={}){return e?e.replace(/\{([^}]+)\}/g,(e,i)=>{var s;return String(null!==(s=t[i])&&void 0!==s?s:`{${i}}`)}):""}(a,i):t}}class Oe{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}}const Ue=(e,t,i,s)=>{!function(e,t,i){const s=new CustomEvent(t,{bubbles:!0,cancelable:!0,composed:!0,detail:i});e.dispatchEvent(s)}(e,"hass-action",{config:i,action:s})},Pe=(e,t)=>{const i=(()=>{const e=document.body;if(e.querySelector("action-handler"))return e.querySelector("action-handler");const t=document.createElement("action-handler");return e.appendChild(t),t})();i&&i.bind(e,t)},He=(e=>(...t)=>({_$litDirective$:e,values:t}))(class extends Oe{update(e,[t]){return Pe(e.element,t),j}render(e){return j}});function Le(e){return void 0!==e&&"none"!==e.action}function Fe(e){return He({hasHold:Le(e.hold_action),hasDoubleClick:Le(e.double_tap_action)})}function Ve(e,t){return e=>{Ue(e.target,0,t,e.detail.action)}}class je extends oe{constructor(){super(...arguments),this.errors=[],this.title="Configuration Issues"}static get styles(){return o`
      :host {
        display: block;
        font-family: var(--font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif);
      }

      .error-container {
        background: #332022;
        border: 1px solid #582533ff;
        border-radius: 1px;
        padding: 16px;
        margin: 8px;
        color: #ffffff;
      }

      .error-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .error-item {
        margin-bottom: 8px;
        line-height: 1.4;
      }

      .error-field {
        font-weight: 600;
        color: #D74133;
      }
    `}render(){if(!this.errors||0===this.errors.length)return V``;const e=this.errors.filter(e=>"critical"===e.severity||"warning"===e.severity);return 0===e.length?V``:V`
      <div class="error-container">
        <ul class="error-list">
          ${e.map(e=>V`
            <li class="error-item">
              <span class="error-field">${e.field}:</span> ${e.message}
            </li>
          `)}
        </ul>
      </div>
    `}}e([de({type:Array})],je.prototype,"errors",void 0),e([de({type:String})],je.prototype,"title",void 0);class We extends oe{static async getConfigElement(){return document.createElement("timeflow-card-editor")}static get styles(){return o`
      :host {
        display: block;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        color: var(--primary-text-color, #222);
        --progress-color: var(--progress-color, #4caf50);
      }
      
      /* FIXED: Set initial background immediately to prevent white flash */
      ha-card {
        display: flex;
        flex-direction: column;
        padding: 0;
        /* Use HA theme border-radius: defaults to 12px, respects user theme */
        border-radius: var(--ha-card-border-radius, var(--ha-border-radius-lg, 12px));
        position: relative;
        overflow: hidden;
        /* Use HA theme background: respects user theme changes */
        background: var(--ha-card-background, var(--card-background-color, var(--secondary-background-color, transparent)));
        /* Use HA theme box-shadow: respects user theme */
        box-shadow: var(--ha-card-box-shadow, 0 2px 10px rgba(0, 0, 0, 0.1));
        /* Use HA theme border: respects user theme */
        border-width: var(--ha-card-border-width, 1px);
        border-style: solid;
        border-color: var(--ha-card-border-color, var(--divider-color, #e0e0e0));
        /* REMOVED: transition that causes flash - only animate specific properties if needed */
        /* transition: background-color 0.3s ease; */
        /* min-height removed - let content determine height, especially for eventy style */
        user-select: none; /* Prevent text selection during interactions */
      }
      
      /* Classic style needs minimum height, but compact styles should auto-size */
      ha-card:not(:has(.card-content-list)):not(:has(.card-content-compact)) {
        min-height: 120px;
      }
      
      /* Make card interactive when actions are configured */
      ha-card[actionHandler] {
        cursor: pointer;
      }
      
      ha-card[actionHandler]:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      
      ha-card[actionHandler]:active {
        transform: translateY(0);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }
      
      /* Error message styling */
      .error {
        color: #721c24;
        padding: 12px;
        border-radius: 16px;
        white-space: pre-wrap;
        word-break: break-word;
      }
      
      /* FIXED: Only show card after initialization to prevent white flash */
      ha-card:not(.initialized) {
        opacity: 0;
      }
      
      ha-card.initialized {
        opacity: 1;
        transition: opacity 0.2s ease-in;
      }
      
      ha-card.expired {
        animation: celebration 0.8s ease-in-out;
      }
      
      .card-content {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 20px;
        height: 100%;
        /* FIXED: Ensure content has proper background inheritance */
        background: inherit;
      }
      
      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0;
      }
      
      .header-icon {
        flex-shrink: 0;
        margin-right: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        /* Size matches title + subtitle height */
        width: var(--header-icon-container-size, 44px);
        height: var(--header-icon-container-size, 44px);
      }
      
      .header-icon ha-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        --mdc-icon-size: var(--header-icon-size, 24px);
      }
      
      .title-section {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      
      .title {
        font-size: var(--timeflow-title-size, 1.5rem);
        font-weight: 500;
        margin: 0;
        opacity: 0.9;
        line-height: 1.3;
        letter-spacing: -0.01em;
        color: var(--timeflow-card-text-color, inherit);
      }
      
      .subtitle {
        font-size: var(--timeflow-subtitle-size, 1rem);
        opacity: 0.65;
        margin: 0;
        font-weight: 400;
        line-height: 1.2;
        color: var(--timeflow-card-text-color, inherit);
      }
      
      .progress-section {
        flex-shrink: 0;
        margin-left: auto;
      }
      
      .content {
        display: flex;
        align-items: flex-end;
        justify-content: flex-end;
        margin-top: auto;
        padding-top: 12px;
      }
      
      .progress-circle {
        opacity: 0.9;
      }
      
      /* ═══════════════════════════════════════════════════════════════════════
         LIST LAYOUT STYLES - Compact horizontal view
         ═══════════════════════════════════════════════════════════════════════ */
      
      .card-content-list {
        display: grid;
        grid-template-areas: "icon title countdown";
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 12px;
        padding: 12px 20px;
        min-height: 50px;
      }
      
      .list-icon {
        grid-area: icon;
        display: flex;
        align-items: center;
        justify-content: center;
        width: var(--list-icon-size, 44px);
        height: var(--list-icon-size, 44px);
        border-radius: var(--ha-card-border-radius, 12px);
        flex-shrink: 0;
      }
      
      .list-icon ha-icon {
        --mdc-icon-size: calc(var(--list-icon-size, 44px) * 0.55);
      }
      
      .list-title-section {
        grid-area: title;
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0; /* Allow text truncation */
      }
      
      .list-title {
        font-weight: 600;
        font-size: var(--list-title-size, 16px);
        line-height: 1.2;
        color: var(--timeflow-card-text-color, var(--primary-text-color));
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .list-subtitle {
        font-size: var(--list-subtitle-size, 13px);
        font-weight: 400;
        line-height: 1.2;
        color: var(--timeflow-card-text-color, var(--primary-text-color));
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .list-countdown {
        grid-area: countdown;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        line-height: 1;
        flex-shrink: 0;
      }
      
      .list-countdown-value {
        font-size: var(--list-countdown-size, 26px);
        font-weight: 700;
        color: var(--timeflow-card-text-color, var(--primary-text-color));
      }
      
      .list-countdown-unit {
        font-size: 10px;
        font-weight: 700;
        opacity: 0.6;
        margin-top: 2px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      /* ═══════════════════════════════════════════════════════════════════════
         CLASSIC COMPACT LAYOUT STYLES - Horizontal view with progress circle
         ═══════════════════════════════════════════════════════════════════════ */
      
      .card-content-compact {
        display: grid;
        grid-template-areas: "icon title progress";
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        min-height: 50px;
      }
      
      .compact-icon {
        grid-area: icon;
        display: flex;
        align-items: center;
        justify-content: center;
        width: var(--compact-icon-size, 44px);
        height: var(--compact-icon-size, 44px);
        border-radius: var(--ha-card-border-radius, 12px);
        flex-shrink: 0;
      }
      
      .compact-icon ha-icon {
        --mdc-icon-size: calc(var(--compact-icon-size, 44px) * 0.55);
      }
      
      .compact-title-section {
        grid-area: title;
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0; /* Allow text truncation */
      }
      
      .compact-title {
        font-weight: 600;
        font-size: var(--compact-title-size, 16px);
        line-height: 1.2;
        color: var(--timeflow-card-text-color, var(--primary-text-color));
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .compact-subtitle {
        font-size: var(--compact-subtitle-size, 13px);
        font-weight: 400;
        line-height: 1.2;
        color: var(--timeflow-card-text-color, var(--primary-text-color));
        opacity: 0.7;
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .compact-progress {
        grid-area: progress;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      
      .compact-progress progress-circle {
        opacity: 0.9;
      }
      
      @keyframes celebration {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        ha-card {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
      }
    `}constructor(){super(),this.hass=null,this.config=We.getStubConfig(),this._resolvedConfig=We.getStubConfig(),this._progress=0,this._countdown={months:0,days:0,hours:0,minutes:0,seconds:0,total:0},this._expired=!1,this._validationResult=null,this._initialized=!1,this._localize=null,this._timerId=null,this.templateService=new ye,this.countdownService=new Ie(this.templateService,_e),this.styleManager=new Ne;const e=We.getStubConfig();this.config=e,this._resolvedConfig=e}static getStubConfig(){return{type:"custom:timeflow-card",target_date:"2026-12-31T23:59:59",creation_date:"2025-12-31T23:59:59",timer_entity:"",title:"New Year Countdown",show_days:!0,show_hours:!0,show_minutes:!0,show_seconds:!0,progress_color:"",background_color:"",stroke_width:15,icon_size:100,expired_animation:!1,expired_text:""}}setConfig(e){try{const t=fe.validateConfig(e);if(this._validationResult=t,t.hasCriticalErrors)this.config=t.safeConfig||We.getStubConfig(),this._resolvedConfig={...this.config};else{if(t.hasWarnings)return this.config={...e},this._resolvedConfig={...e},this._initialized=!0,void this.requestUpdate();this.config={...e},this._resolvedConfig={...e}}this._initialized=!1,this.templateService.clearTemplateCache(),this.styleManager.clearCache(),this._updateCountdownAndRender().then(()=>{this._initialized=!0,this.requestUpdate()})}catch(t){this._validationResult={isValid:!1,errors:[{field:"config",message:t.message||"Unexpected configuration error",severity:"critical",suggestion:"Check console for details and verify your configuration syntax.",value:e}],hasCriticalErrors:!0,hasWarnings:!1,safeConfig:We.getStubConfig()},this.config=We.getStubConfig(),this._resolvedConfig={...this.config},this._initialized=!0,this.requestUpdate()}}firstUpdated(){this.templateService.card=this,this._updateCountdownAndRender().then(()=>{this._initialized=!0,this.requestUpdate(),this._startCountdownUpdates()})}connectedCallback(){super.connectedCallback(),this.templateService.connect()}disconnectedCallback(){super.disconnectedCallback(),this._stopCountdownUpdates(),this.templateService.disconnect()}updated(e){(e.has("hass")||e.has("config"))&&(this.hass&&(this._localize=Re(this.hass)),this._updateCountdownAndRender())}_startCountdownUpdates(){this._stopCountdownUpdates(),this._timerId=setInterval(()=>{this._updateCountdownAndRender()},1e3)}_stopCountdownUpdates(){this._timerId&&(clearInterval(this._timerId),this._timerId=null)}async _updateCountdownAndRender(){var e;if(null===(e=this._validationResult)||void 0===e?void 0:e.hasCriticalErrors)return;const t={...this.config},i=["target_date","creation_date","timer_entity","title","subtitle","text_color","background_color","progress_color","primary_color","secondary_color","expired_text","header_icon","header_icon_color","header_icon_background"];for(const s of i)if("string"==typeof t[s])if("timer_entity"===s){if(this.templateService.isTemplate(t[s])){const e=await this.templateService.resolveValue(t[s]);t[s]=e||void 0}}else{const e=await this.templateService.resolveValue(t[s]);t[s]=e||void 0}this._resolvedConfig=t,await this.countdownService.updateCountdown(t,this.hass),this._countdown={...this.countdownService.getTimeRemaining()},this._expired=this.countdownService.isExpired(),this._progress=await this.countdownService.calculateProgress(t,this.hass),this.requestUpdate()}render(){if(this._validationResult&&!this._validationResult.isValid)return V`
        <error-display
          .errors="${this._validationResult.errors}"
          .title="${this._validationResult.hasCriticalErrors?"Configuration Error":"Configuration Issues"}"
        ></error-display>
      `;const e=this._resolvedConfig.style||"classic";return"eventy"===e?this._renderEventyCard():"classic-compact"===e?this._renderClassicCompactCard():this._renderCard()}_renderCard(){const{title:e,subtitle:t,text_color:i,background_color:s,progress_color:r,stroke_width:a,icon_size:o,expired_animation:n=!0,expired_text:l="",width:c,height:d,aspect_ratio:u,show_months:h,show_days:m,show_hours:p,show_minutes:g,show_seconds:_,compact_format:f}=this._resolvedConfig,v=[h,m,p,g,_].filter(e=>!0===e).length,y=!0===f||!1!==f&&v>=3,{cardBackground:b,textColor:x}=this._getCardColors(),w=r||i||"var(--progress-color, #4caf50)",T=this.styleManager.calculateDynamicIconSize(c,d,u,o),$=this.styleManager.calculateDynamicStrokeWidth(T,a),S=this.styleManager.calculateProportionalSizes(c,d,u),C=this.styleManager.generateCardDimensionStyles(c,d,u),A=[...b?[`background: ${b}`,`--timeflow-card-background-color: ${b}`]:[],...x?[`color: ${x}`,`--timeflow-card-text-color: ${x}`,`--progress-text-color: ${x}`]:[],`--timeflow-card-progress-color: ${w}`,`--timeflow-card-icon-size: ${T}px`,`--timeflow-card-stroke-width: ${$}`,`--timeflow-title-size: ${S.titleSize}rem`,`--timeflow-subtitle-size: ${S.subtitleSize}rem`,...C].join("; "),D=this._resolvedConfig.timer_entity||this._resolvedConfig.auto_discover_alexa||this._resolvedConfig.auto_discover_google?!1!==f:y;let M;if(this._resolvedConfig.timer_entity&&this.hass){const e=ge.getTimerData(this._resolvedConfig.timer_entity,this.hass);M=e?this._expired&&(e.isAlexaTimer||e.isGoogleTimer)?ge.getTimerSubtitle(e,!1!==this._resolvedConfig.show_seconds,this._localize||void 0,D):this._expired?l||this.countdownService.getSubtitle(this._resolvedConfig,this.hass,this._localize||void 0,D):t||ge.getTimerSubtitle(e,!1!==this._resolvedConfig.show_seconds,this._localize||void 0,D):this._expired?l||this.countdownService.getSubtitle(this._resolvedConfig,this.hass,this._localize||void 0,D):t||this.countdownService.getSubtitle(this._resolvedConfig,this.hass,this._localize||void 0,D)}else M=this._resolvedConfig.auto_discover_alexa?t||this.countdownService.getSubtitle(this._resolvedConfig,this.hass,this._localize||void 0,D):this._expired?l||this.countdownService.getSubtitle(this._resolvedConfig,this.hass,this._localize||void 0,D):t||this.countdownService.getSubtitle(this._resolvedConfig,this.hass,this._localize||void 0,D);const E=this._getTitleText(),I=this._getCardClasses(n),{configWithDefaults:N,shouldEnableActions:k}=this._getActionConfig();return V`
      <ha-card 
        class="${I}" 
        style="${A}"
        ?actionHandler=${k}
        .actionHandler=${k?Fe(N):void 0}
        @action=${k&&this.hass?Ve(this.hass,N):void 0}
      >
        <div class="card-content">
          <header class="header" style="${this._resolvedConfig.header_icon?`--header-icon-container-size: calc(${S.titleSize}rem * 1.3 + ${S.subtitleSize}rem * 1.2 + 2px); --header-icon-size: calc(${S.titleSize}rem * 0.9 + ${S.subtitleSize}rem * 0.7);`:""}">
            ${this._resolvedConfig.header_icon?V`
              <div class="header-icon" style="${this._resolvedConfig.header_icon_background?`background: ${this._resolvedConfig.header_icon_background}; border-radius: var(--ha-card-border-radius, 12px);`:""}">
                <ha-icon 
                  icon="${this._resolvedConfig.header_icon}"
                  style="color: ${this._resolvedConfig.header_icon_color||"var(--primary-text-color)"}"
                ></ha-icon>
              </div>
            `:""}
            <div class="title-section">
              <h2 class="title" aria-live="polite">${E}</h2>
              <p class="subtitle" aria-live="polite">${M}</p>
            </div>
          </header>
          
          <div class="content" role="group" aria-label="Countdown Progress">
            <div class="progress-section">
              <progress-circle
                class="progress-circle"
                .progress="${this._progress}"
                .color="${w}"
                .size="${T}"
                .strokeWidth="${$}"
                aria-label="Countdown progress: ${Math.round(this._progress)}%"
              ></progress-circle>
            </div>
          </div>
        </div>
      </ha-card>
    `}_renderEventyCard(){const{title:e,subtitle:t,text_color:i,background_color:s,expired_animation:r=!0,expired_text:a="",header_icon:o="mdi:calendar-clock",header_icon_color:n,header_icon_background:l,show_months:c,show_days:d,show_hours:u,show_minutes:h,show_seconds:m,compact_format:p}=this._resolvedConfig,{primaryValue:g,primaryUnit:_}=this._getPrimaryCountdownUnit(),{cardBackground:f,textColor:v}=this._getCardColors(),y=[...f?[`background: ${f}`,`--timeflow-card-background-color: ${f}`]:[],...v?[`color: ${v}`,`--timeflow-card-text-color: ${v}`]:[]].join("; "),b=this._getCardClasses(r);let x;x=t||(this._expired?a||"Completed":this._formatTargetDate());const w=this._getTitleText(),{configWithDefaults:T,shouldEnableActions:$}=this._getActionConfig();return V`
      <ha-card 
        class="${b}" 
        style="${y}"
        ?actionHandler=${$}
        .actionHandler=${$?Fe(T):void 0}
        @action=${$&&this.hass?Ve(this.hass,T):void 0}
      >
        <div class="card-content-list">
          <!-- Icon -->
          <div 
            class="list-icon" 
            style="background: ${l||"rgba(var(--rgb-primary-color, 66, 133, 244), 0.15)"};"
          >
            <ha-icon 
              icon="${o}"
              style="color: ${n||"var(--primary-color, var(--primary-text-color))"}"
            ></ha-icon>
          </div>
          
          <!-- Title & Subtitle -->
          <div class="list-title-section">
            <h2 class="list-title">${w}</h2>
            <p class="list-subtitle">${x}</p>
          </div>
          
          <!-- Countdown Display -->
          <div class="list-countdown">
            <span class="list-countdown-value">${g}</span>
            <span class="list-countdown-unit">${_}</span>
          </div>
        </div>
      </ha-card>
    `}_renderClassicCompactCard(){const{title:e,subtitle:t,text_color:i,background_color:s,progress_color:r,stroke_width:a=15,icon_size:o=100,expired_animation:n=!0,expired_text:l="",header_icon:c="mdi:calendar-clock",header_icon_color:d,header_icon_background:u,compact_format:h}=this._resolvedConfig,{cardBackground:m,textColor:p}=this._getCardColors(),g=[...m?[`background: ${m}`,`--timeflow-card-background-color: ${m}`]:[],...p?[`color: ${p}`,`--timeflow-card-text-color: ${p}`]:[]].join("; "),_=this._getCardClasses(n),f=!1!==h;let v;v=t||(this._expired?l||"Completed":this.countdownService.getSubtitle(this._resolvedConfig,this.hass,this._localize||void 0,f));const y=this._getTitleText(),{configWithDefaults:b,shouldEnableActions:x}=this._getActionConfig(),w=o||100,T=Math.min(w,50),$=Math.max(4,.4*(a||15)),S=r||"var(--primary-color)";return V`
      <ha-card 
        class="${_}" 
        style="${g}"
        ?actionHandler=${x}
        .actionHandler=${x?Fe(b):void 0}
        @action=${x&&this.hass?Ve(this.hass,b):void 0}
      >
        <div class="card-content-compact">
          <!-- Icon -->
          <div 
            class="compact-icon" 
            style="background: ${u||"rgba(var(--rgb-primary-color, 66, 133, 244), 0.15)"};"
          >
            <ha-icon 
              icon="${c}"
              style="color: ${d||"var(--primary-color, var(--primary-text-color))"}"
            ></ha-icon>
          </div>
          
          <!-- Title & Subtitle -->
          <div class="compact-title-section">
            <h2 class="compact-title">${y}</h2>
            <p class="compact-subtitle">${v}</p>
          </div>
          
          <!-- Progress Circle -->
          <div class="compact-progress">
            <progress-circle
              .progress="${this._progress}"
              .color="${S}"
              .size="${T}"
              .strokeWidth="${$}"
              aria-label="Countdown progress: ${Math.round(this._progress)}%"
            ></progress-circle>
          </div>
        </div>
      </ha-card>
    `}_getPrimaryCountdownUnit(){const{months:e,days:t,hours:i,minutes:s,seconds:r,total:a}=this._countdown,{show_months:o,show_days:n,show_hours:l,show_minutes:c,show_seconds:d}=this._resolvedConfig,u=this._localize||void 0;if(!1!==o&&e>0)return{primaryValue:e,primaryUnit:Ee("month",e,u)};if(!1!==n&&t>0){const i=(!1===o?30*e:0)+t;return{primaryValue:i,primaryUnit:Ee("day",i,u)}}if(!1!==l&&i>0)return{primaryValue:i,primaryUnit:Ee("hour",i,u)};if(!1!==c&&s>0)return{primaryValue:s,primaryUnit:Ee("minute",s,u)};if(!1!==d&&r>0)return{primaryValue:r,primaryUnit:Ee("second",r,u)};const h=a||0;if(h<=0)return{primaryValue:0,primaryUnit:Ee(!1!==d?"second":"day",0,u)};const m=Ce(h);return m.days>0?{primaryValue:m.days,primaryUnit:Ee("day",m.days,u)}:m.hours>0?{primaryValue:m.hours,primaryUnit:Ee("hour",m.hours,u)}:m.minutes>0?{primaryValue:m.minutes,primaryUnit:Ee("minute",m.minutes,u)}:m.seconds>0?{primaryValue:m.seconds,primaryUnit:Ee("second",m.seconds,u)}:{primaryValue:0,primaryUnit:Ee("second",0,u)}}_formatTargetDate(){var e,t;const i=this._resolvedConfig.target_date;if(!i)return"";try{const s=new Date(i);if(isNaN(s.getTime()))return"";const r=(null===(t=null===(e=this.hass)||void 0===e?void 0:e.locale)||void 0===t?void 0:t.language)||navigator.language||"en",a={weekday:"short",month:"short",day:"numeric"};return s.toLocaleDateString(r,a)}catch{return""}}_getCardColors(){const{background_color:e,text_color:t}=this._resolvedConfig;return{cardBackground:e||"",textColor:t||""}}_getCardClasses(e=!0){return[this._initialized?"initialized":"",this._expired&&e?"expired":""].filter(Boolean).join(" ")}_getTitleText(){const{title:e,expired_text:t=""}=this._resolvedConfig;return null==e||"string"==typeof e&&""===e.trim()?this._resolvedConfig.timer_entity&&this.hass?ge.getTimerTitle(this._resolvedConfig.timer_entity,this.hass):this._resolvedConfig.auto_discover_alexa||this._resolvedConfig.auto_discover_google?"Countdown Timer":this._expired&&t||"Countdown Timer":e}_getActionConfig(){const e={...this._resolvedConfig};e.timer_entity&&!e.entity&&(e.entity=e.timer_entity),e.entity&&!e.tap_action&&(e.tap_action={action:"more-info"});return{configWithDefaults:e,shouldEnableActions:!!(e.tap_action||e.hold_action||e.double_tap_action)}}getCardSize(){const{aspect_ratio:e="2/1",height:t,style:i}=this.config;if("eventy"===i)return 1;if(t){const e=parseInt("string"==typeof t?t:t.toString());return e<=100?1:e<=150?2:e<=200?3:4}if(e){const[t,i]=e.split("/").map(Number);if(!t||!i)return 3;const s=i/t;return s>=1.5?4:s>=1?3:2}return 3}static get version(){return"3.2"}}e([de({type:Object})],We.prototype,"hass",void 0),e([de({type:Object})],We.prototype,"config",void 0),e([ue()],We.prototype,"_resolvedConfig",void 0),e([ue()],We.prototype,"_progress",void 0),e([ue()],We.prototype,"_countdown",void 0),e([ue()],We.prototype,"_expired",void 0),e([ue()],We.prototype,"_validationResult",void 0),e([ue()],We.prototype,"_initialized",void 0),e([ue()],We.prototype,"_localize",void 0);class Ge extends oe{static get styles(){return o`
      :host {
        display: inline-block;
        vertical-align: middle;
      }
      .progress-wrapper {
        position: relative;
      }
      svg {
        display: block;
        margin: 0 auto;
      }
      .updating {
        transition: stroke-dashoffset 0.3s ease;
      }
    `}constructor(){super(),this.progress=0,this.color="#4CAF50",this.size=100,this.strokeWidth=15,this.progress=0,this.color="#4CAF50",this.size=100,this.strokeWidth=15}updated(e){var t;if(e.has("progress")){const e=null===(t=this.renderRoot)||void 0===t?void 0:t.querySelector(".progress-bar");e&&(e.classList.add("updating"),setTimeout(()=>{e&&e.classList.remove("updating")},400))}}updateProgress(e,t=!0){var i;if(t)this.progress=e;else{const t=null===(i=this.renderRoot)||void 0===i?void 0:i.querySelector(".progress-bar");this.progress=e,t&&(t.style.transition="none"),setTimeout(()=>{t&&(t.style.transition="")},20)}}getProgress(){return this.progress}render(){const e=Math.max(0,Math.min(100,Number(this.progress)||0)),t=Number(this.size)||100,i=Number(this.strokeWidth)||15,s=(t-i)/2,r=2*Math.PI*s,a=r-e/100*r;return V`
      <div class="progress-wrapper" style="width:${t}px; height:${t}px;">
        <svg
          class="progress-circle"
          height="${t}" width="${t}"
          style="overflow:visible;"
        >
          <circle
            class="progress-bg"
            cx="${t/2}" cy="${t/2}"
            r="${s}"
            fill="none"
            stroke="#FFFFFF1A"
            stroke-width="${i}"
          ></circle>
          <circle
            class="progress-bar"
            cx="${t/2}" cy="${t/2}"
            r="${s}"
            fill="none"
            stroke="${this.color}"
            stroke-width="${i}"
            stroke-linecap="round"
            style="
              stroke-dasharray: ${r};
              stroke-dashoffset: ${a};
              transition: stroke-dashoffset 0.3s ease;
              transform: rotate(-90deg);
              transform-origin: ${t/2}px ${t/2}px;
            "
          ></circle>
        </svg>
      </div>
    `}}e([de({type:Number})],Ge.prototype,"progress",void 0),e([de({type:String})],Ge.prototype,"color",void 0),e([de({type:Number})],Ge.prototype,"size",void 0),e([de({type:Number})],Ge.prototype,"strokeWidth",void 0);class Be extends oe{constructor(){super(...arguments),this.hass=null,this._config={type:"custom:timeflow-card"},this._targetDateTemplateMode=!1,this._creationDateTemplateMode=!1}static get styles(){return o`
            .section-header {
                font-weight: 500;
                font-size: 14px;
                color: var(--primary-text-color);
                margin: 16px 0 8px 0;
                padding-bottom: 4px;
                border-bottom: 1px solid var(--divider-color);
            }
            .section-header:first-of-type {
                margin-top: 8px;
            }
            ha-form {
                display: block;
            }
            
            /* Date field with mode toggle */
            .date-field-container {
                display: flex;
                flex-direction: column;
                gap: 4px;
                margin-bottom: 16px;
            }
            .date-field-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .date-field-label {
                font-weight: 500;
                font-size: 14px;
                color: var(--primary-text-color);
            }
            .mode-toggle {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 12px;
                color: var(--secondary-text-color);
                cursor: pointer;
                padding: 4px 8px;
                border-radius: 4px;
                background: var(--secondary-background-color);
                border: none;
            }
            .mode-toggle:hover {
                background: var(--primary-color);
                color: var(--text-primary-color);
            }
            .mode-toggle ha-icon {
                --mdc-icon-size: 16px;
            }
            .date-helper {
                font-size: 12px;
                color: var(--secondary-text-color);
                margin-top: 4px;
            }
            ha-textfield, input[type="datetime-local"] {
                width: 100%;
            }
            input[type="datetime-local"] {
                padding: 12px;
                border: 1px solid var(--divider-color);
                border-radius: 4px;
                background: var(--card-background-color);
                color: var(--primary-text-color);
                font-size: 14px;
            }
            input[type="datetime-local"]:focus {
                outline: none;
                border-color: var(--primary-color);
            }
            .date-fields-section {
                display: flex;
                flex-direction: column;
                gap: 16px;
                padding: 16px 0;
            }
        `}setConfig(e){this._config={...e};const t=e.target_date||"",i=e.creation_date||"";this._targetDateTemplateMode=this._isTemplate(t),this._creationDateTemplateMode=this._isTemplate(i)}_isTemplate(e){return e.includes("{{")||e.includes("{%")}_convertToDatetimeLocal(e){if(!e||this._isTemplate(e))return"";try{const t=new Date(e);if(isNaN(t.getTime()))return"";const i=t.getFullYear(),s=String(t.getMonth()+1).padStart(2,"0"),r=String(t.getDate()).padStart(2,"0"),a=String(t.getHours()).padStart(2,"0");return`${i}-${s}-${r}T${a}:${String(t.getMinutes()).padStart(2,"0")}`}catch{return""}}_convertFromDatetimeLocal(e){return e?e+":00":""}_fireConfigChanged(e){this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0}))}_formChanged(e){var t,i;const s=(null===(t=e.detail)||void 0===t?void 0:t.value)||{},r={...this._config||{},...s,type:(null===(i=this._config)||void 0===i?void 0:i.type)||"custom:timeflow-card"};this._config=r,this._fireConfigChanged(r)}_computeHelper(e){return{timer_entity:"Select a timer, sensor, or input_datetime entity",target_date:'ISO date, entity, or template: "2024-12-31T23:59:59", "{{ states(\'input_datetime.deadline\') }}"',creation_date:"Start date for progress calculation (optional)",auto_discover_alexa:"Automatically find active Alexa timers",auto_discover_google:"Automatically find active Google Home timers",alexa_device_filter:'Comma-separated list of Alexa device names or IDs to filter timers (e.g., "Kitchen, Living Room")',prefer_labeled_timers:"Prefer timers with labels over unnamed ones",title:"Card title - supports templates: \"{{ states('sensor.event_name') }}\"",subtitle:"Shows time remaining by default; only set for custom text",subtitle_prefix:'Text before countdown (e.g., "in", "Only")',subtitle_suffix:'Text after countdown (e.g., "left", "remaining")',expired_text:"Text shown when countdown completes",compact_format:'"2d 5h 30m" vs "2 days 5 hours 30 minutes"',progress_color:"Progress circle color (hex, name, rgb, or template)",background_color:"Card background color",text_color:"Text color for title and countdown",width:'Card width (e.g., "300px", "100%", "20em")',height:'Card height (e.g., "200px", "auto")',aspect_ratio:'Width:height ratio (e.g., "16/9", "4/3", "1/1")',stroke_width:"Thickness of the progress circle ring",icon_size:"Size of the progress circle",header_icon:'Material Design icon name (e.g., "mdi:cake-variant")',header_icon_color:"Icon color (hex, name, or template)",header_icon_background:'Icon background (e.g., "rgba(59, 130, 246, 0.2)")',style:"Card style: Classic (vertical with circle), Eventy (compact horizontal), Classic Compact (horizontal with circle)"}[e.name]||""}_computeLabel(e){var t;if(e.label)return e.label;const i={timer_entity:"Timer Entity",target_date:"Target Date/Time",creation_date:"Start Date (for progress)",auto_discover_alexa:"Auto-discover Alexa Timers",auto_discover_google:"Auto-discover Google Timers",alexa_device_filter:"Alexa Device Filter",prefer_labeled_timers:"Prefer Labeled Timers",show_alexa_device:"Show Alexa Device Name",show_days:"Days",show_hours:"Hours",show_minutes:"Minutes",show_seconds:"Seconds",show_months:"Months",compact_format:"Compact Format",subtitle_prefix:"Subtitle Prefix",subtitle_suffix:"Subtitle Suffix",expired_animation:"Expired Animation",expired_text:"Expired Text",progress_color:"Progress Color",background_color:"Background Color",text_color:"Text Color",stroke_width:"Stroke Width",icon_size:"Circle Size",aspect_ratio:"Aspect Ratio",header_icon:"Header Icon",header_icon_color:"Icon Color",header_icon_background:"Icon Background",style:"Card Style"};if(i[e.name])return i[e.name];const s=(null!==(t=e.name)&&void 0!==t?t:"").toString();return s?s.split("_").map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(" "):""}_renderDateField(e,t,i,s,r){const a=this._config[e]||"";return V`
            <div class="date-field-container">
                <div class="date-field-header">
                    <span class="date-field-label">${t}</span>
                    <button 
                        class="mode-toggle" 
                        @click=${r}
                        title=${s?"Switch to date picker":"Switch to template/Jinja mode"}
                    >
                        <ha-icon icon=${s?"mdi:calendar":"mdi:code-braces"}></ha-icon>
                        ${s?"Picker":"Template"}
                    </button>
                </div>
                
                ${s?V`
                        <ha-textfield
                            .value=${a}
                            .placeholder=${"{{ states('input_datetime.my_date') }}"}
                            @input=${t=>this._updateDateField(e,t.target.value)}
                        ></ha-textfield>
                        <div class="date-helper">Enter Jinja template, entity, or ISO date string</div>
                    `:V`
                        <input 
                            type="datetime-local"
                            .value=${this._convertToDatetimeLocal(a)}
                            @input=${t=>this._updateDateField(e,this._convertFromDatetimeLocal(t.target.value))}
                        />
                        <div class="date-helper">${i}</div>
                    `}
            </div>
        `}_updateDateField(e,t){const i={...this._config,[e]:t};this._config=i,this._fireConfigChanged(i)}_toggleTargetDateMode(){this._targetDateTemplateMode=!this._targetDateTemplateMode}_toggleCreationDateMode(){this._creationDateTemplateMode=!this._creationDateTemplateMode}_getEffectiveCompactFormat(){const{show_months:e,show_days:t,show_hours:i,show_minutes:s,show_seconds:r,compact_format:a}=this._config;if(void 0!==a)return a;const o=[e,t,i,s,r].filter(e=>!0===e).length;return o>=3}render(){const e={...this._config||{},compact_format:this._getEffectiveCompactFormat()};return V`
            <!-- Date Fields with Template Toggle -->
            <div class="date-fields-section">
                ${this._renderDateField("target_date","Target Date","Date/time when countdown ends",this._targetDateTemplateMode,()=>this._toggleTargetDateMode())}
                
                ${this._renderDateField("creation_date","Creation Date","Start date (defaults to now)",this._creationDateTemplateMode,()=>this._toggleCreationDateMode())}
            </div>
            
            <ha-form
                .hass=${this.hass}
                .data=${e}
                .schema=${[{name:"style",selector:{select:{options:[{value:"classic",label:"Classic (Circle Progress)"},{value:"eventy",label:"Eventy (Compact Horizontal)"},{value:"classic-compact",label:"Classic Compact (Horizontal + Circle)"}],mode:"dropdown"}}},{name:"timer_entity",selector:{entity:{domain:["timer","sensor","input_datetime"]}}},{type:"grid",schema:[{name:"auto_discover_alexa",selector:{boolean:{}}},{name:"auto_discover_google",selector:{boolean:{}}}]},{name:"title",selector:{text:{}}},{name:"subtitle",selector:{text:{}}},{type:"grid",schema:[{name:"subtitle_prefix",selector:{text:{}}},{name:"subtitle_suffix",selector:{text:{}}}]},{name:"expired_text",selector:{text:{}}},{type:"expandable",title:"Header Icon",icon:"mdi:image-filter-vintage",schema:[{name:"header_icon",selector:{icon:{}}},{type:"grid",schema:[{name:"header_icon_color",selector:{text:{}}},{name:"header_icon_background",selector:{text:{}}}]}]},{type:"grid",schema:[{name:"show_months",selector:{boolean:{}}},{name:"show_days",selector:{boolean:{}}},{name:"show_hours",selector:{boolean:{}}},{name:"show_minutes",selector:{boolean:{}}},{name:"show_seconds",selector:{boolean:{}}},{name:"compact_format",selector:{boolean:{}}}]},{type:"expandable",title:"Appearance",icon:"mdi:palette",schema:[{name:"progress_color",selector:{text:{}}},{name:"background_color",selector:{text:{}}},{name:"text_color",selector:{text:{}}},{name:"expired_animation",selector:{boolean:{}}}]},{type:"expandable",title:"Layout",icon:"mdi:page-layout-body",schema:[{type:"grid",schema:[{name:"width",selector:{text:{}}},{name:"height",selector:{text:{}}}]},{name:"aspect_ratio",selector:{text:{}}}]},{type:"expandable",title:"Progress Circle",icon:"mdi:circle-slice-3",schema:[{type:"grid",schema:[{name:"stroke_width",selector:{number:{min:1,max:50,step:1}}},{name:"icon_size",selector:{number:{min:10,max:350,step:5}}}]}]},{type:"expandable",title:"Smart Assistant Options",icon:"mdi:home-assistant",schema:[{name:"alexa_device_filter",selector:{text:{}}},{name:"prefer_labeled_timers",selector:{boolean:{}}},{name:"show_alexa_device",selector:{boolean:{}}}]},{type:"expandable",title:"Tap Actions",icon:"mdi:gesture-tap",schema:[{name:"tap_action",selector:{ui_action:{}}},{name:"hold_action",selector:{ui_action:{}}},{name:"double_tap_action",selector:{ui_action:{}}}]}]}
                @value-changed=${e=>this._formChanged(e)}
                .computeLabel=${this._computeLabel}
                .computeHelper=${this._computeHelper}
            ></ha-form>
        `}}e([de({type:Object})],Be.prototype,"hass",void 0),e([ue()],Be.prototype,"_config",void 0),e([ue()],Be.prototype,"_targetDateTemplateMode",void 0),e([ue()],Be.prototype,"_creationDateTemplateMode",void 0),customElements.get("error-display")||customElements.define("error-display",je),customElements.get("progress-circle")||customElements.define("progress-circle",Ge),customElements.get("timeflow-card")||customElements.define("timeflow-card",We),customElements.get("timeflow-card-editor")||customElements.define("timeflow-card-editor",Be),window.customCards=window.customCards||[],window.customCards.push({type:"timeflow-card",name:"TimeFlow Card",description:"A beautiful countdown timer card with progress circle for Home Assistant, using Lit",preview:!0,documentationURL:"https://github.com/Rishi8078/TimeFlow-Card"});export{je as ErrorDisplay,Ge as ProgressCircle,We as TimeFlowCard,Be as TimeFlowCardEditor};
//# sourceMappingURL=timeflow-card.js.map
