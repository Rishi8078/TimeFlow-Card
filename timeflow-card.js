function e(e,t,i,s){var r,o=arguments.length,a=o<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,s);else for(var n=e.length-1;n>=0;n--)(r=e[n])&&(a=(o<3?r(a):o>3?r(t,i,a):r(t,i))||a);return o>3&&a&&Object.defineProperty(t,i,a),a}"function"==typeof SuppressedError&&SuppressedError;const t=globalThis,i=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),r=new WeakMap;let o=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(i&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=r.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&r.set(t,e))}return e}toString(){return this.cssText}};const a=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,i,s)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[s+1],e[0]);return new o(i,e,s)},n=i?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new o("string"==typeof e?e:e+"",void 0,s))(t)})(e):e,{is:l,defineProperty:c,getOwnPropertyDescriptor:d,getOwnPropertyNames:u,getOwnPropertySymbols:h,getPrototypeOf:m}=Object,p=globalThis,_=p.trustedTypes,g=_?_.emptyScript:"",f=p.reactiveElementPolyfillSupport,y=(e,t)=>e,v={toAttribute(e,t){switch(t){case Boolean:e=e?g:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},b=(e,t)=>!l(e,t),w={attribute:!0,type:String,converter:v,reflect:!1,useDefault:!1,hasChanged:b};Symbol.metadata??=Symbol("metadata"),p.litPropertyMetadata??=new WeakMap;let x=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=w){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(e,i,t);void 0!==s&&c(this.prototype,e,s)}}static getPropertyDescriptor(e,t,i){const{get:s,set:r}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:s,set(t){const o=s?.call(this);r?.call(this,t),this.requestUpdate(e,o,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??w}static _$Ei(){if(this.hasOwnProperty(y("elementProperties")))return;const e=m(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(y("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(y("properties"))){const e=this.properties,t=[...u(e),...h(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[t,i]of this.elementProperties){const e=this._$Eu(t,i);void 0!==e&&this._$Eh.set(e,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(n(e))}else void 0!==e&&t.push(n(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,s)=>{if(i)e.adoptedStyleSheets=s.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const i of s){const s=document.createElement("style"),r=t.litNonce;void 0!==r&&s.setAttribute("nonce",r),s.textContent=i.cssText,e.appendChild(s)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,i);if(void 0!==s&&!0===i.reflect){const r=(void 0!==i.converter?.toAttribute?i.converter:v).toAttribute(t,i.type);this._$Em=e,null==r?this.removeAttribute(s):this.setAttribute(s,r),this._$Em=null}}_$AK(e,t){const i=this.constructor,s=i._$Eh.get(e);if(void 0!==s&&this._$Em!==s){const e=i.getPropertyOptions(s),r="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:v;this._$Em=s;const o=r.fromAttribute(t,e.type);this[s]=o??this._$Ej?.get(s)??o,this._$Em=null}}requestUpdate(e,t,i){if(void 0!==e){const s=this.constructor,r=this[e];if(i??=s.getPropertyOptions(e),!((i.hasChanged??b)(r,t)||i.useDefault&&i.reflect&&r===this._$Ej?.get(e)&&!this.hasAttribute(s._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:s,wrapped:r},o){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,o??t??this[e]),!0!==r||void 0!==o)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===s&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,s=this[t];!0!==e||this._$AL.has(t)||void 0===s||this.C(t,void 0,i,s)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[y("elementProperties")]=new Map,x[y("finalized")]=new Map,f?.({ReactiveElement:x}),(p.reactiveElementVersions??=[]).push("2.1.1");const $=globalThis,S=$.trustedTypes,T=S?S.createPolicy("lit-html",{createHTML:e=>e}):void 0,C="$lit$",k=`lit$${Math.random().toFixed(9).slice(2)}$`,M="?"+k,A=`<${M}>`,E=document,D=()=>E.createComment(""),I=e=>null===e||"object"!=typeof e&&"function"!=typeof e,N=Array.isArray,R="[ \t\n\f\r]",z=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,P=/-->/g,H=/>/g,O=RegExp(`>|${R}(?:([^\\s"'>=/]+)(${R}*=${R}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),L=/'/g,F=/"/g,U=/^(?:script|style|textarea|title)$/i,G=(e=>(t,...i)=>({_$litType$:e,strings:t,values:i}))(1),V=Symbol.for("lit-noChange"),j=Symbol.for("lit-nothing"),W=new WeakMap,q=E.createTreeWalker(E,129);function B(e,t){if(!N(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==T?T.createHTML(t):t}const Y=(e,t)=>{const i=e.length-1,s=[];let r,o=2===t?"<svg>":3===t?"<math>":"",a=z;for(let n=0;n<i;n++){const t=e[n];let i,l,c=-1,d=0;for(;d<t.length&&(a.lastIndex=d,l=a.exec(t),null!==l);)d=a.lastIndex,a===z?"!--"===l[1]?a=P:void 0!==l[1]?a=H:void 0!==l[2]?(U.test(l[2])&&(r=RegExp("</"+l[2],"g")),a=O):void 0!==l[3]&&(a=O):a===O?">"===l[0]?(a=r??z,c=-1):void 0===l[1]?c=-2:(c=a.lastIndex-l[2].length,i=l[1],a=void 0===l[3]?O:'"'===l[3]?F:L):a===F||a===L?a=O:a===P||a===H?a=z:(a=O,r=void 0);const u=a===O&&e[n+1].startsWith("/>")?" ":"";o+=a===z?t+A:c>=0?(s.push(i),t.slice(0,c)+C+t.slice(c)+k+u):t+k+(-2===c?n:u)}return[B(e,o+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),s]};class K{constructor({strings:e,_$litType$:t},i){let s;this.parts=[];let r=0,o=0;const a=e.length-1,n=this.parts,[l,c]=Y(e,t);if(this.el=K.createElement(l,i),q.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(s=q.nextNode())&&n.length<a;){if(1===s.nodeType){if(s.hasAttributes())for(const e of s.getAttributeNames())if(e.endsWith(C)){const t=c[o++],i=s.getAttribute(e).split(k),a=/([.?@])?(.*)/.exec(t);n.push({type:1,index:r,name:a[2],strings:i,ctor:"."===a[1]?ee:"?"===a[1]?te:"@"===a[1]?ie:Q}),s.removeAttribute(e)}else e.startsWith(k)&&(n.push({type:6,index:r}),s.removeAttribute(e));if(U.test(s.tagName)){const e=s.textContent.split(k),t=e.length-1;if(t>0){s.textContent=S?S.emptyScript:"";for(let i=0;i<t;i++)s.append(e[i],D()),q.nextNode(),n.push({type:2,index:++r});s.append(e[t],D())}}}else if(8===s.nodeType)if(s.data===M)n.push({type:2,index:r});else{let e=-1;for(;-1!==(e=s.data.indexOf(k,e+1));)n.push({type:7,index:r}),e+=k.length-1}r++}}static createElement(e,t){const i=E.createElement("template");return i.innerHTML=e,i}}function J(e,t,i=e,s){if(t===V)return t;let r=void 0!==s?i._$Co?.[s]:i._$Cl;const o=I(t)?void 0:t._$litDirective$;return r?.constructor!==o&&(r?._$AO?.(!1),void 0===o?r=void 0:(r=new o(e),r._$AT(e,i,s)),void 0!==s?(i._$Co??=[])[s]=r:i._$Cl=r),void 0!==r&&(t=J(e,r._$AS(e,t.values),r,s)),t}let Z=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,s=(e?.creationScope??E).importNode(t,!0);q.currentNode=s;let r=q.nextNode(),o=0,a=0,n=i[0];for(;void 0!==n;){if(o===n.index){let t;2===n.type?t=new X(r,r.nextSibling,this,e):1===n.type?t=new n.ctor(r,n.name,n.strings,this,e):6===n.type&&(t=new se(r,this,e)),this._$AV.push(t),n=i[++a]}o!==n?.index&&(r=q.nextNode(),o++)}return q.currentNode=E,s}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}};class X{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,s){this.type=2,this._$AH=j,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=J(this,e,t),I(e)?e===j||null==e||""===e?(this._$AH!==j&&this._$AR(),this._$AH=j):e!==this._$AH&&e!==V&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>N(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==j&&I(this._$AH)?this._$AA.nextSibling.data=e:this.T(E.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,s="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=K.createElement(B(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(t);else{const e=new Z(s,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=W.get(e.strings);return void 0===t&&W.set(e.strings,t=new K(e)),t}k(e){N(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,s=0;for(const r of e)s===t.length?t.push(i=new X(this.O(D()),this.O(D()),this,this.options)):i=t[s],i._$AI(r),s++;s<t.length&&(this._$AR(i&&i._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=e.nextSibling;e.remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class Q{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,s,r){this.type=1,this._$AH=j,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=r,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=j}_$AI(e,t=this,i,s){const r=this.strings;let o=!1;if(void 0===r)e=J(this,e,t,0),o=!I(e)||e!==this._$AH&&e!==V,o&&(this._$AH=e);else{const s=e;let a,n;for(e=r[0],a=0;a<r.length-1;a++)n=J(this,s[i+a],t,a),n===V&&(n=this._$AH[a]),o||=!I(n)||n!==this._$AH[a],n===j?e=j:e!==j&&(e+=(n??"")+r[a+1]),this._$AH[a]=n}o&&!s&&this.j(e)}j(e){e===j?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class ee extends Q{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===j?void 0:e}}class te extends Q{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==j)}}class ie extends Q{constructor(e,t,i,s,r){super(e,t,i,s,r),this.type=5}_$AI(e,t=this){if((e=J(this,e,t,0)??j)===V)return;const i=this._$AH,s=e===j&&i!==j||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,r=e!==j&&(i===j||s);s&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class se{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){J(this,e)}}const re={I:X},oe=$.litHtmlPolyfillSupport;oe?.(K,X),($.litHtmlVersions??=[]).push("3.3.1");const ae=globalThis;let ne=class extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const s=i?.renderBefore??t;let r=s._$litPart$;if(void 0===r){const e=i?.renderBefore??null;s._$litPart$=r=new X(t.insertBefore(D(),e),e,void 0,i??{})}return r._$AI(e),r})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return V}};ne._$litElement$=!0,ne.finalized=!0,ae.litElementHydrateSupport?.({LitElement:ne});const le=ae.litElementPolyfillSupport;le?.({LitElement:ne}),(ae.litElementVersions??=[]).push("4.2.1");const ce={attribute:!0,type:String,converter:v,reflect:!1,hasChanged:b},de=(e=ce,t,i)=>{const{kind:s,metadata:r}=i;let o=globalThis.litPropertyMetadata.get(r);if(void 0===o&&globalThis.litPropertyMetadata.set(r,o=new Map),"setter"===s&&((e=Object.create(e)).wrapped=!0),o.set(i.name,e),"accessor"===s){const{name:s}=i;return{set(i){const r=t.get.call(this);t.set.call(this,i),this.requestUpdate(s,r,e)},init(t){return void 0!==t&&this.C(s,void 0,e,t),t}}}if("setter"===s){const{name:s}=i;return function(i){const r=this[s];t.call(this,i),this.requestUpdate(s,r,e)}}throw Error("Unsupported decorator location: "+s)};function ue(e){return(t,i)=>"object"==typeof i?de(e,t,i):((e,t,i)=>{const s=t.hasOwnProperty(i);return t.constructor.createProperty(i,e),s?Object.getOwnPropertyDescriptor(t,i):void 0})(e,t,i)}function he(e){return ue({...e,state:!0,attribute:!1})}const me=2,pe=e=>(...t)=>({_$litDirective$:e,values:t});let _e=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};const{I:ge}=re,fe=()=>document.createComment(""),ye=(e,t,i)=>{const s=e._$AA.parentNode,r=void 0===t?e._$AB:t._$AA;if(void 0===i){const t=s.insertBefore(fe(),r),o=s.insertBefore(fe(),r);i=new ge(t,o,e,e.options)}else{const t=i._$AB.nextSibling,o=i._$AM,a=o!==e;if(a){let t;i._$AQ?.(e),i._$AM=e,void 0!==i._$AP&&(t=e._$AU)!==o._$AU&&i._$AP(t)}if(t!==r||a){let e=i._$AA;for(;e!==t;){const t=e.nextSibling;s.insertBefore(e,r),e=t}}}return i},ve=(e,t,i=e)=>(e._$AI(t,i),e),be={},we=(e,t=be)=>e._$AH=t,xe=e=>{e._$AR(),e._$AA.remove()},$e=(e,t,i)=>{const s=new Map;for(let r=t;r<=i;r++)s.set(e[r],r);return s},Se=pe(class extends _e{constructor(e){if(super(e),e.type!==me)throw Error("repeat() can only be used in text expressions")}dt(e,t,i){let s;void 0===i?i=t:void 0!==t&&(s=t);const r=[],o=[];let a=0;for(const n of e)r[a]=s?s(n,a):a,o[a]=i(n,a),a++;return{values:o,keys:r}}render(e,t,i){return this.dt(e,t,i).values}update(e,[t,i,s]){const r=(e=>e._$AH)(e),{values:o,keys:a}=this.dt(t,i,s);if(!Array.isArray(r))return this.ut=a,o;const n=this.ut??=[],l=[];let c,d,u=0,h=r.length-1,m=0,p=o.length-1;for(;u<=h&&m<=p;)if(null===r[u])u++;else if(null===r[h])h--;else if(n[u]===a[m])l[m]=ve(r[u],o[m]),u++,m++;else if(n[h]===a[p])l[p]=ve(r[h],o[p]),h--,p--;else if(n[u]===a[p])l[p]=ve(r[u],o[p]),ye(e,l[p+1],r[u]),u++,p--;else if(n[h]===a[m])l[m]=ve(r[h],o[m]),ye(e,r[u],r[h]),h--,m++;else if(void 0===c&&(c=$e(a,m,p),d=$e(n,u,h)),c.has(n[u]))if(c.has(n[h])){const t=d.get(a[m]),i=void 0!==t?r[t]:null;if(null===i){const t=ye(e,r[u]);ve(t,o[m]),l[m]=t}else l[m]=ve(i,o[m]),ye(e,r[u],i),r[t]=null;m++}else xe(r[h]),h--;else xe(r[u]),u++;for(;m<=p;){const t=ye(e,l[p+1]);ve(t,o[m]),l[m++]=t}for(;u<=h;){const e=r[u++];null!==e&&xe(e)}return this.ut=a,we(e,l),V}});class Te{static getStandardTimerData(e,t,i){const s=t.state,r=t.attributes,o="active"===s,a="paused"===s,n="idle"===s;let l=0;r.duration&&(l=i(r.duration));let c=0,d=null;(o||a)&&(r.finishes_at?(d=new Date(r.finishes_at),isNaN(d.getTime())||(c=Math.max(0,Math.floor((d.getTime()-Date.now())/1e3)))):r.remaining&&(c=i(r.remaining)));let u=this.lastKnownState.get(e);u||(u={wasRunning:!1,finishedPending:!1},this.lastKnownState.set(e,u)),o||a?(u.wasRunning=!0,u.finishedPending=!1):n&&u.wasRunning&&(u.finishedPending=!0,u.wasRunning=!1);let h=0;if(l>0)if(n)h=u.finishedPending?100:0;else{const e=l-c;h=Math.min(100,Math.max(0,e/l*100))}return{isActive:o,isPaused:a,duration:l,remaining:c,finishesAt:d,progress:h,isAlexaTimer:!1}}}Te.lastKnownState=new Map;class Ce{static getAlexaTimerData(e,t,i,s,r){var o,a,n,l,c,d,u,h,m;const{state:p,attributes:_}=t,g=null!==(o=this.parseJson(_.sorted_active))&&void 0!==o?o:[],f=null!==(a=this.parseJson(_.sorted_all))&&void 0!==a?a:[],y=null!==(l=null!==(n=_.total_active)&&void 0!==n?n:g.length)&&void 0!==l?l:0,v=null!==(d=null!==(c=_.total_all)&&void 0!==c?c:f.length)&&void 0!==d?d:0,b=new Map;for(const z of g){const e=this.extractTimerEntry(z);e&&b.set(e.id,e.data)}const w=new Map;for(const z of f){const e=this.extractTimerEntry(z);e&&w.set(e.id,e.data)}const x=Date.now();let $=this.alexaIdCache.get(e);$||($={},this.alexaIdCache.set(e,$));const S=[];for(const[z,P]of b.entries()){const e="number"==typeof(null==P?void 0:P.triggerTime)?P.triggerTime:0;e&&e<=x&&S.push({id:z,trig:e})}S.length>0?(S.sort((e,t)=>e.trig-t.trig),$.finishedWhileActiveId=S[0].id):$.finishedWhileActiveId&&!b.has($.finishedWhileActiveId)&&delete $.finishedWhileActiveId;let T,C=!1,k=!1,M=!1,A=null;if(y>0&&g.length>0)if($.finishedWhileActiveId&&b.has($.finishedWhileActiveId))T=$.finishedWhileActiveId,A=null!==(u=b.get(T))&&void 0!==u?u:null,C=!!A,M=!0;else{if(1===g.length){const e=this.extractTimerEntry(g[0]);T=null==e?void 0:e.id,A=null!==(h=null==e?void 0:e.data)&&void 0!==h?h:null}else{let e,t=null,i=Number.POSITIVE_INFINITY;for(const s of g){const r=this.extractTimerEntry(s);r&&"number"==typeof(null===(m=r.data)||void 0===m?void 0:m.remainingTime)&&r.data.remainingTime<i&&(i=r.data.remainingTime,t=r.data,e=r.id)}T=e,A=t}C=!!A,C&&A&&"number"==typeof A.triggerTime&&A.triggerTime<=x&&(M=!0,$.finishedWhileActiveId=T)}else if(v>0&&f.length>0){let e=null,t=-1/0;for(const[i,s]of w.entries())if("PAUSED"===(null==s?void 0:s.status)){const r="number"==typeof s.lastUpdatedDate?s.lastUpdatedDate:-1/0;r>t&&(t=r,e=s,T=i)}e&&(A=e,k=!0)}let E=0,D=0,I=null,N=0;if(A){const e=Date.now(),t="number"==typeof A.remainingTime?A.remainingTime:0,i="number"==typeof A.originalDurationInMillis?A.originalDurationInMillis:0,s="number"==typeof A.triggerTime?A.triggerTime:0;if(D=Math.max(0,Math.floor(i/1e3)),C?(s&&s>e?(E=Math.max(0,Math.floor((s-e)/1e3)),I=new Date(s)):(E=Math.max(0,Math.floor(t/1e3)),E>0&&(I=new Date(e+1e3*E))),(s&&s<=e||E<=0||"OFF"===A.status&&0===t)&&(E=0,I=null,M=!0)):(E=Math.max(0,Math.floor(t/1e3)),I=null),D>0){const e=Math.max(0,D-E);N=Math.min(100,Math.max(0,e/D*100)),C&&N>=100&&(E=0,M=!0)}}else{if(p&&"unavailable"!==p&&"unknown"!==p&&(s(p)?(I=new Date(p),isNaN(I.getTime())||(E=Math.max(0,Math.floor((I.getTime()-Date.now())/1e3)))):isNaN(parseFloat(p))?"string"==typeof p&&p.includes(":")&&(E=r(p)):E=Math.max(0,parseFloat(p))),_.original_duration)D=r(_.original_duration);else if(_.duration)D=r(_.duration);else if(I&&t.last_changed){const e=new Date(t.last_changed).getTime(),i=I.getTime();!isNaN(e)&&i>e&&(D=Math.floor((i-e)/1e3))}if(D>0){const e=D-E;N=Math.min(100,Math.max(0,e/D*100))}}let R=this.extractTimerLabel(A);if(!R&&g.length>0){const e=this.extractTimerEntry(g[0]);R=this.extractTimerLabel(null==e?void 0:e.data)}return{isActive:C,isPaused:k,duration:D,remaining:E,finishesAt:I,progress:N,finished:M,isAlexaTimer:!0,alexaDevice:this.extractAlexaDevice(e,_),timerLabel:null!=R?R:this.extractAlexaDevice(e,_),timerStatus:k?"PAUSED":C?"ON":"OFF",userDefinedLabel:R}}static parseAllTimers(e,t){var i,s,r;const o=(null==t?void 0:t.attributes)||{},a=null!==(i=this.parseJson(o.sorted_active))&&void 0!==i?i:[],n=null!==(s=this.parseJson(o.sorted_all))&&void 0!==s?s:[],l=this.extractAlexaDevice(e,o),c=Date.now(),d=[],u=new Set;for(const h of a){const t=this.extractTimerEntry(h);t&&!u.has(t.id)&&(u.add(t.id),d.push(this.buildListEntry(e,t.id,t.data,l,c)))}for(const h of n){const t=this.extractTimerEntry(h);t&&!u.has(t.id)&&("PAUSED"===(null===(r=t.data)||void 0===r?void 0:r.status)&&(u.add(t.id),d.push(this.buildListEntry(e,t.id,t.data,l,c))))}return d}static buildListEntry(e,t,i,s,r){const o="number"==typeof(null==i?void 0:i.remainingTime)?i.remainingTime:0,a="number"==typeof(null==i?void 0:i.originalDurationInMillis)?i.originalDurationInMillis:0,n="number"==typeof(null==i?void 0:i.triggerTime)?i.triggerTime:0,l="PAUSED"===(null==i?void 0:i.status),c=Math.max(0,Math.floor(a/1e3));let d=0,u=null,h=!1;l?d=Math.max(0,Math.floor(o/1e3)):n>r?(d=Math.max(0,Math.floor((n-r)/1e3)),u=new Date(n)):!n&&o>0?(d=Math.max(0,Math.floor(o/1e3)),u=new Date(r+1e3*d)):h=!0;let m=0;if(c>0){const e=Math.max(0,c-d);m=Math.min(100,Math.max(0,e/c*100))}h&&(m=100);const p=this.extractTimerLabel(i);return{isActive:!l&&!h,isPaused:l,duration:c,remaining:d,finishesAt:u,progress:m,finished:h,isAlexaTimer:!0,alexaDevice:s,timerLabel:null!=p?p:s,timerStatus:l?"PAUSED":h?"OFF":"ON",userDefinedLabel:p,timerId:t,entityId:e,deviceName:s}}static parseLegacyAlexaTimer(e,t,i,s,r,o){let a=0,n=0,l=null,c=!1;if(i&&"unavailable"!==i&&"unknown"!==i)if(r(i)){if(l=new Date(i),!isNaN(l.getTime())){const e=Date.now();a=Math.max(0,Math.floor((l.getTime()-e)/1e3)),c=a>0}}else isNaN(parseFloat(i))?"string"==typeof i&&i.includes(":")&&(a=o(i),c=a>0):(a=Math.max(0,parseFloat(i)),c=a>0);let d=!1;if(s.original_duration)n=o(s.original_duration),d=!0;else if(s.duration)n=o(s.duration),d=!0;else if(l&&t.last_changed){const e=new Date(t.last_changed).getTime(),i=l.getTime();!isNaN(e)&&i>e&&(n=Math.floor((i-e)/1e3),d=!0)}d||(n=a>0?a:0,d=!1);let u=0;if(d&&n>0)if(c&&a>=0){const e=n-a;u=Math.min(100,Math.max(0,e/n*100))}else 0===a&&n>0&&(u=100);else if(c&&a>0){const e=t.last_changed?new Date(t.last_changed).getTime():Date.now(),i=(Date.now()-e)/1e3;if(i<a){const e=a+i,t=i;u=Math.min(100,Math.max(0,t/e*100))}else u=0}else u=0;return{isActive:c,isPaused:!1,duration:n,remaining:a,finishesAt:l,progress:u,isAlexaTimer:!0,alexaDevice:this.extractAlexaDevice(e,s),timerLabel:s.friendly_name||s.timer_label||this.formatAlexaTimerName(e),timerStatus:c?"ON":"OFF",userDefinedLabel:void 0}}static discoverAlexaTimers(e,t,i,s){var r,o;if(!e||!e.states)return[];const a=[];for(const n in e.states)if(t(n)){null==s||s(n);const t=e.states[n].attributes||{},l=null!==(r=this.parseJson(t.sorted_active))&&void 0!==r?r:[],c=null!==(o=this.parseJson(t.sorted_all))&&void 0!==o?o:[],d=Array.isArray(l)&&l.length>0;let u=!1;if(!d&&Array.isArray(c)&&c.length>0)for(const e of c){const t=this.extractTimerEntry(e),i=null==t?void 0:t.data;if(i&&"PAUSED"===i.status&&"number"==typeof i.remainingTime&&i.remainingTime>0){u=!0;break}}if(d||u){a.push(n);continue}const h=i(n,e);h&&(h.isActive||h.isPaused)&&a.push(n)}return a}static parseJson(e){if(Array.isArray(e))return e;if("string"==typeof e)try{return JSON.parse(e)}catch{}return null}static extractTimerEntry(e){return e&&"object"==typeof e&&!Array.isArray(e)&&e.id?{id:String(e.id),data:e}:Array.isArray(e)&&e.length>=2&&e[0]&&e[1]?{id:String(e[0]),data:e[1]}:null}static extractTimerLabel(e){if(e)return e.timerLabel?e.timerLabel:e.label?e.label:void 0}static extractAlexaDevice(e,t){if(t.friendly_name){let e=t.friendly_name;if(e=e.replace(/\s*next\s*timer$/i,"").replace(/\s*timer$/i,"").replace(/\s*echo\s*timer$/i,"").replace(/\s*alexa\s*timer$/i,"").trim(),e)return e}if(e.includes("_next_timer")){const t=e.replace(/^sensor\./,"").replace(/_next_timer$/,"").replace(/_/g," ").replace(/\b\w/g,e=>e.toUpperCase());if(t)return t}return t.device_name?t.device_name:t.device?t.device:"Alexa Device"}static formatAlexaTimerName(e){return e.replace(/^sensor\./,"").replace(/_next_timer$/,"").replace(/_timer$/,"").replace(/_/g," ").replace(/\b\w/g,e=>e.toUpperCase())}}Ce.alexaIdCache=new Map;class ke{static getGoogleTimerData(e,t,i,s){const{state:r,attributes:o}=t,a=o.timers||[];if(!Array.isArray(a)||0===a.length){const t=this.googleIdCache.get(e);return(null==t?void 0:t.finishedTimerId)&&(delete t.finishedTimerId,delete t.lastDuration,delete t.lastLabel),{isActive:!1,isPaused:!1,duration:0,remaining:0,finishesAt:null,progress:0,finished:!1,isGoogleTimer:!0,userDefinedLabel:void 0,googleTimerId:void 0,googleTimerStatus:"none"}}const n=new Map,l=new Map;for(const T of a)T.timer_id&&(l.set(String(T.timer_id),T),"set"!==T.status&&"ringing"!==T.status||n.set(String(T.timer_id),T));const c=Date.now()/1e3;let d=this.googleIdCache.get(e);d||(d={},this.googleIdCache.set(e,d));const u=[];for(const[T,C]of n.entries())C.fire_time&&C.fire_time<=c&&"ringing"!==C.status&&u.push({id:T,fireTime:C.fire_time,timer:C});for(const T of a)if(T.timer_id&&"ringing"===T.status){const e=String(T.timer_id),t=T.fire_time||c-1;u.push({id:e,fireTime:t,timer:T})}if(u.length>0){u.sort((e,t)=>t.fireTime-e.fireTime),d.finishedTimerId=u[0].id;const e=u[0].timer;e&&(d.lastDuration=e.duration||0,d.lastLabel=e.label||"Timer")}if(d.finishedTimerId){a.some(e=>String(e.timer_id)===d.finishedTimerId)||(delete d.finishedTimerId,delete d.lastDuration,delete d.lastLabel)}let h=null,m=null;for(const T of a)if(T.timer_id&&"ringing"===T.status)return{isActive:!1,isPaused:!1,duration:T.duration||0,remaining:0,finishesAt:null,progress:100,finished:!0,isGoogleTimer:!0,userDefinedLabel:T.label||void 0,googleTimerId:String(T.timer_id),googleTimerStatus:"ringing"};if(d.finishedTimerId&&l.has(d.finishedTimerId)){const e=l.get(d.finishedTimerId);if(e&&e.fire_time<=c)return{isActive:!1,isPaused:!1,duration:e.duration||0,remaining:0,finishesAt:null,progress:100,finished:!0,isGoogleTimer:!0,userDefinedLabel:e.label||void 0,googleTimerId:String(e.timer_id),googleTimerStatus:e.status||"ringing"}}let p=Number.POSITIVE_INFINITY;for(const[T,C]of n.entries())C.fire_time&&C.fire_time<p&&(p=C.fire_time,h=C,m=T);if(!h)for(const T of a)if(T.timer_id){if("paused"===String(T.status||"").toLowerCase().trim()){h=T,m=String(T.timer_id);break}}if(!h){if(!(a.length>0))return null;h=a[0],m=String(a[0].timer_id||"unknown")}const _=String(h.status||"").toLowerCase().trim(),g="set"===_||"ringing"===_,f="paused"===_,y="ringing"===_,v="number"==typeof h.duration?h.duration:s(h.duration||"0");let b=0,w=null,x=!1;d.pausedSnapshots||(d.pausedSnapshots=new Map);const $=d.pausedSnapshots.get(m);if(g){const e=h.fire_time?1e3*h.fire_time:0;e&&e>Date.now()?(b=Math.max(0,Math.floor((e-Date.now())/1e3)),w=new Date(e),d.pausedSnapshots.set(m,{remaining:b,pausedAt:c,wasActive:!0})):(b=0,w=null,x=!0)}else f?(b=$?$.remaining:v,d.pausedSnapshots.set(m,{remaining:b,pausedAt:c,wasActive:!1}),w=null):(b=0,w=null,x=!0);let S=0;if(v>0)if(y||x||0===b&&!f)S=100;else{const e=Math.max(0,v-b);S=Math.min(100,Math.max(0,e/v*100))}return x||(x=y||0===b&&!f),d.pausedSnapshots&&m&&(x||g)&&(g&&!1===(null==$?void 0:$.wasActive)||x)&&d.pausedSnapshots.delete(m),{isActive:g&&!y,isPaused:f,duration:v,remaining:b,finishesAt:w,progress:S,finished:x,isGoogleTimer:!0,userDefinedLabel:h.label||void 0,googleTimerId:m||void 0,googleTimerStatus:h.status}}static parseAllTimers(e,t,i){var s;const r=(null==t?void 0:t.attributes)||{},o=r.timers||[];if(!Array.isArray(o)||0===o.length)return[];const a=this.extractDeviceName(e,r),n=Date.now(),l=n/1e3;let c=this.googleIdCache.get(e);c||(c={},this.googleIdCache.set(e,c)),c.pausedSnapshots||(c.pausedSnapshots=new Map);const d=c.pausedSnapshots,u=[];for(const h of o){const t=String((null==h?void 0:h.status)||"").toLowerCase().trim();if("set"!==t&&"ringing"!==t&&"paused"!==t)continue;const r=String(null!==(s=null==h?void 0:h.timer_id)&&void 0!==s?s:`${e}:${u.length}`),o="number"==typeof(null==h?void 0:h.duration)?h.duration:i((null==h?void 0:h.duration)||"0"),c="ringing"===t,m="paused"===t;let p=0,_=null,g=c;if(m){const e=d.get(r);p=e?e.remaining:o,d.set(r,{remaining:p,pausedAt:l,wasActive:!1})}else if(c)p=0;else{const e=(null==h?void 0:h.fire_time)?1e3*h.fire_time:0;e>n?(p=Math.max(0,Math.floor((e-n)/1e3)),_=new Date(e),d.set(r,{remaining:p,pausedAt:l,wasActive:!0})):(g=!0,d.delete(r))}let f=0;if(o>0){const e=Math.max(0,o-p);f=Math.min(100,Math.max(0,e/o*100))}g&&(f=100),u.push({isActive:!m&&!g,isPaused:m,duration:o,remaining:p,finishesAt:_,progress:f,finished:g,isGoogleTimer:!0,userDefinedLabel:(null==h?void 0:h.label)||void 0,googleTimerId:r,googleTimerStatus:c?"ringing":m?"paused":"set",timerId:r,entityId:e,deviceName:a})}return u}static extractDeviceName(e,t){const i=null==t?void 0:t.friendly_name;if("string"==typeof i&&i.trim()){const e=i.replace(/\s*timers$/i,"").trim();if(e)return e}const s=e.replace(/^sensor\./,"").replace(/_timers$/,"").replace(/_/g," ").replace(/\b\w/g,e=>e.toUpperCase()).trim();return s||"Google Home"}static discoverGoogleTimers(e,t,i,s){if(!e||!e.states)return[];const r=[];for(const o in e.states)if(t(o)){null==s||s(o);const t=(e.states[o].attributes||{}).timers||[];if(Array.isArray(t)&&t.length>0){t.some(e=>{const t=String(e.status||"").toLowerCase().trim();return"set"===t||"ringing"===t||"paused"===t})&&r.push(o)}}return r}static clearFinishedTimer(e){const t=this.googleIdCache.get(e);t&&t.finishedTimerId&&(delete t.finishedTimerId,delete t.lastDuration,delete t.lastLabel)}}ke.googleIdCache=new Map;class Me{static isTimerEntity(e){return!!e&&(!!e.startsWith("timer.")||(!!(e.includes("_next_timer")||e.includes("alexa_timer")||e.startsWith("sensor.")&&e.includes("timer"))||(!(!e.startsWith("sensor.")||!e.endsWith("_timers"))||!(!e.includes("google_home")||!e.includes("timer")))))}static isAlexaTimer(e){return e.includes("_next_timer")||e.includes("alexa_timer")||e.startsWith("sensor.")&&e.includes("alexa")&&e.includes("timer")}static isGoogleTimer(e){return!(!e.startsWith("sensor.")||!e.endsWith("_timers"))||e.includes("google_home")&&e.includes("timer")}static getTimerData(e,t){if(!t||!e||!this.isTimerEntity(e))return null;const i=t.states[e];return i?this.isAlexaTimer(e)?Ce.getAlexaTimerData(e,i,t,this.isISOTimestamp,this.parseDuration):this.isGoogleTimer(e)?ke.getGoogleTimerData(e,i,t,this.parseDuration):Te.getStandardTimerData(e,i,this.parseDuration):null}static listTimers(e,t){var i,s,r;if(!t||!e||!this.isTimerEntity(e))return[];const o=t.states[e];if(!o)return[];if(this.isAlexaTimer(e))return Ce.parseAllTimers(e,o);if(this.isGoogleTimer(e))return ke.parseAllTimers(e,o,this.parseDuration);const a=Te.getStandardTimerData(e,o,this.parseDuration);return a&&(a.isActive||a.isPaused)?[{...a,timerId:e,entityId:e,deviceName:(null===(i=o.attributes)||void 0===i?void 0:i.friendly_name)||e,userDefinedLabel:null!==(s=a.userDefinedLabel)&&void 0!==s?s:null===(r=o.attributes)||void 0===r?void 0:r.friendly_name}]:[]}static discoverAlexaTimers(e,t){return Ce.discoverAlexaTimers(e,e=>this.isAlexaTimer(e),(e,t)=>this.getTimerData(e,t),t)}static discoverGoogleTimers(e,t){return ke.discoverGoogleTimers(e,e=>this.isGoogleTimer(e),(e,t)=>this.getTimerData(e,t),t)}static isISOTimestamp(e){return/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?([+-]\d{2}:\d{2}|Z)?$/.test(e)}static parseDuration(e){if("number"==typeof e)return e;if("string"!=typeof e)return 0;if(e.includes(":")){const t=e.split(":").map(Number);if(3===t.length)return 3600*t[0]+60*t[1]+t[2];if(2===t.length)return 60*t[0]+t[1]}const t=parseFloat(e);return isNaN(t)?0:t}static formatRemainingTime(e,t=!0,i,s=!0){if(e<=0)return"0:00";const r=Math.floor(e/3600),o=Math.floor(e%3600/60),a=Math.floor(e%60);if(s){const e=i?i("time.hour_compact"):"h",s=i?i("time.minute_compact"):"m",n=i?i("time.second_compact"):"s";return r>0?t?`${r}${e} ${o.toString().padStart(2,"0")}${s} ${a.toString().padStart(2,"0")}${n}`:`${r}${e} ${o.toString().padStart(2,"0")}${s}`:t?`${o}${s} ${a.toString().padStart(2,"0")}${n}`:`${o}${s}`}{const e=[];if(r>0){const t=i?i(1===r?"time.hour_full":"time.hours_full"):1===r?"hour":"hours";e.push(`${r} ${t}`)}if(o>0){const t=i?i(1===o?"time.minute_full":"time.minutes_full"):1===o?"minute":"minutes";e.push(`${o} ${t}`)}if(t&&a>0){const t=i?i(1===a?"time.second_full":"time.seconds_full"):1===a?"second":"seconds";e.push(`${a} ${t}`)}return 0===e.length?"0 "+(i?i("time.minutes_full"):"minutes"):e.join(" ")}}static getTimerTitle(e,t,i){if(i)return i;if(!t||!e)return"Timer";const s=t.states[e];if(!s)return"Timer";if(this.isAlexaTimer(e)){const i=Ce.getAlexaTimerData(e,s,t,this.isISOTimestamp,this.parseDuration);return(null==i?void 0:i.timerLabel)?i.timerLabel:this.formatAlexaTimerName(e)}if(this.isGoogleTimer(e)){const i=ke.getGoogleTimerData(e,s,t,this.parseDuration);return(null==i?void 0:i.userDefinedLabel)?i.userDefinedLabel:this.formatGoogleTimerName(e)}return s.attributes.friendly_name||e.replace("timer.","").replace(/_/g," ")}static formatAlexaTimerName(e){return e.replace(/^sensor\./,"").replace(/_next_timer$/,"").replace(/_timer$/,"").replace(/_/g," ").replace(/\b\w/g,e=>e.toUpperCase())}static formatGoogleTimerName(e){return e.replace(/^sensor\./,"").replace(/_timers$/,"").replace(/_/g," ").replace(/\b\w/g,e=>e.toUpperCase())+" Timers"}static isTimerExpired(e){return!!e&&(e.isAlexaTimer||e.isGoogleTimer?!!e.finished||0===e.remaining&&e.progress>=100:!e.isActive&&!e.isPaused&&e.progress>=100)}static getTimerSubtitle(e,t=!0,i,s=!0){if(!e)return"Timer not found";const r=i||(e=>e);if(e.isAlexaTimer){if(e.finished)return e.userDefinedLabel?r("timer.complete_with_label",{label:e.userDefinedLabel}):r("timer.complete");if(e.isActive&&e.remaining>0){const o=this.formatRemainingTime(e.remaining,t,i,s);return e.userDefinedLabel?r("timer.remaining_with_label",{time:o,label:e.userDefinedLabel}):e.alexaDevice?r("timer.remaining_with_device",{time:o,device:e.alexaDevice}):r("timer.remaining",{time:o})}if(e.isPaused&&e.remaining>0){const o=this.formatRemainingTime(e.remaining,t,i,s);return e.userDefinedLabel?r("timer.paused_with_time",{label:e.userDefinedLabel,time:o}):e.alexaDevice?r("timer.paused_alexa",{device:e.alexaDevice,time:o}):r("timer.paused_without_label",{time:o})}return e.finished||0===e.remaining&&e.progress>=100?e.userDefinedLabel?r("timer.complete_with_label",{label:e.userDefinedLabel}):r("timer.complete"):e.alexaDevice?r("timer.no_timers_device",{device:e.alexaDevice}):r("timer.no_timers")}if(e.isGoogleTimer){const o="ringing"===e.googleTimerStatus;if(e.finished||o)return e.userDefinedLabel?r("timer.complete_with_label",{label:e.userDefinedLabel}):r("timer.complete");if(e.isActive&&e.remaining>0){const o=this.formatRemainingTime(e.remaining,t,i,s);return e.userDefinedLabel?r("timer.remaining_with_label",{time:o,label:e.userDefinedLabel}):r("timer.remaining_with_device",{time:o,device:"Google Home"})}if(e.isPaused&&e.remaining>0){const o=this.formatRemainingTime(e.remaining,t,i,s);return e.userDefinedLabel?r("timer.paused_with_time",{label:e.userDefinedLabel,time:o}):r("timer.google_paused",{time:o})}return e.finished||o||0===e.remaining&&e.progress>=100?e.userDefinedLabel?r("timer.complete_with_label",{label:e.userDefinedLabel}):r("timer.complete"):r("timer.no_timers_google")}return e.isActive?r("timer.remaining",{time:this.formatRemainingTime(e.remaining,t,i,s)}):e.isPaused?r("timer.paused_time_left",{time:this.formatRemainingTime(e.remaining,t,i,s)}):e.duration>0?r("timer.ready_with_time",{time:this.formatRemainingTime(e.duration,t,i,s)}):r("timer.timer_ready")}static getTimerStateColor(e,t="#4caf50"){return e?e.isAlexaTimer?e.isActive&&e.remaining>0?"#00d4ff":this.isTimerExpired(e)?"#ff4444":"#888888":e.isGoogleTimer?e.isActive&&e.remaining>0?"#34a853":this.isTimerExpired(e)?"#ff4444":"#888888":e.isActive?"#4caf50":e.isPaused?"#ff9800":this.isTimerExpired(e)?"#f44336":"#9e9e9e":t}}class Ae{static parseISODate(e){try{const t=this.parseISODateManual(e);if(!isNaN(t))return t}catch(pe){}const t=new Date(e);return!isNaN(t.getTime())&&this.isValidDateResult(t,e)?t.getTime():this.parseISODateFallback(e)}static isValidDateResult(e,t){const i=e.getTime(),s=new Date("1970-01-01").getTime(),r=new Date("2100-12-31").getTime();if(i<s||i>r)return!1;if("string"==typeof t&&t.includes("02-29")){const t=e.getFullYear();if(!this.isLeapYear(t))return!1}return!0}static isLeapYear(e){return e%4==0&&e%100!=0||e%400==0}static parseISODateManual(e){if("string"==typeof e&&e.includes("T")){if(/[+-]\d{2}:\d{2}$|Z$/.test(e))return new Date(e).getTime();{const[t,i]=e.split("T"),[s,r,o]=t.split("-").map(Number);if(!this.isValidDateComponents(s,r,o))throw new Error("Invalid date components");if(i&&i.includes(":")){const[e,t,a]=i.split(":").map(parseFloat);if(!this.isValidTimeComponents(e,t,a))throw new Error("Invalid time components");return new Date(s,r-1,o,e,t,a||0).getTime()}return new Date(s,r-1,o).getTime()}}return new Date(e).getTime()}static isValidDateComponents(e,t,i){if(isNaN(e)||isNaN(t)||isNaN(i))return!1;if(e<1970||e>2100)return!1;if(t<1||t>12)return!1;if(i<1||i>31)return!1;return!(i>[31,this.isLeapYear(e)?29:28,31,30,31,30,31,31,30,31,30,31][t-1])}static isValidTimeComponents(e,t,i){const s=parseInt(e),r=parseInt(t),o=parseInt(i);return!(isNaN(s)||isNaN(r)||isNaN(o))&&(!(s<0||s>23)&&(!(r<0||r>59)&&!(o<0||o>59)))}static parseISODateFallback(e){try{const t=Date.parse(e);return isNaN(t)?Date.now():t}catch(t){return Date.now()}}}const Ee=1e3,De=6e4,Ie=36e5,Ne=864e5,Re=6048e5,ze=60,Pe=3600;function He(e){if("number"==typeof e&&Number.isFinite(e)&&e>0)return e*Ee;if("string"!=typeof e)return 0;const t=e.trim();if(!t)return 0;if(t.includes(":")){const e=t.split(":").map(Number);if(e.some(e=>Number.isNaN(e)||e<0))return 0;if(3===e.length)return(3600*e[0]+60*e[1]+e[2])*Ee;if(2===e.length)return(60*e[0]+e[1])*Ee}if(/^\d+(\.\d+)?$/.test(t))return parseFloat(t)*Ee;const i=t.toLowerCase(),s=[...i.matchAll(/(\d+(?:\.\d+)?)\s*(w|d|h|m|s)\b/g)];if(0===s.length)return 0;if(s.map(e=>e[0]).join("").replace(/\s+/g,"")!==i.replace(/\s+/g,""))return 0;const r={w:Re,d:Ne,h:Ie,m:De,s:Ee};return s.reduce((e,[,t,i])=>e+parseFloat(t)*r[i],0)}const Oe={eventy:{year:{singular:"YEAR",plural:"YEARS"},month:{singular:"MONTH",plural:"MONTHS"},week:{singular:"WEEK",plural:"WEEKS"},day:{singular:"DAY",plural:"DAYS"},hour:{singular:"HOUR",plural:"HOURS"},minute:{singular:"MIN",plural:"MINS"},second:{singular:"SEC",plural:"SECS"}},mainDisplay:{year:{singular:"year left",plural:"years left"},month:{singular:"month left",plural:"months left"},week:{singular:"week left",plural:"weeks left"},day:{singular:"day left",plural:"days left"},hour:{singular:"hour left",plural:"hours left"},minute:{singular:"minute left",plural:"minutes left"},second:{singular:"second left",plural:"seconds left"}},timer:{year:{singular:"year",plural:"years"},month:{singular:"month",plural:"months"},week:{singular:"week",plural:"weeks"},day:{singular:"day",plural:"days"},hour:{singular:"hour",plural:"hours"},minute:{singular:"minute",plural:"minutes"},second:{singular:"second",plural:"seconds"}}};function Le(e,t,i="mainDisplay"){const s=Oe[i][e];return 1===t?s.singular:s.plural}const Fe={year:{singular:"time.year_eventy",plural:"time.years_eventy"},month:{singular:"time.month_eventy",plural:"time.months_eventy"},week:{singular:"time.week_eventy",plural:"time.weeks_eventy"},day:{singular:"time.day_eventy",plural:"time.days_eventy"},hour:{singular:"time.hour_eventy",plural:"time.hours_eventy"},minute:{singular:"time.minute_eventy",plural:"time.minutes_eventy"},second:{singular:"time.second_eventy",plural:"time.seconds_eventy"}};function Ue(e,t,i){if(!i)return Le(e,t,"eventy");const s=Fe[e];return i(1===t?s.singular:s.plural)}class Ge{static validateConfig(e){const t=[];if(!e)return t.push({field:"config",message:"Configuration object is missing or empty",severity:"critical",suggestion:"Provide a valid configuration object with at least a target_date field.",value:e}),{isValid:!1,errors:t,hasCriticalErrors:!0,hasWarnings:!1};e.target_date?this.isValidDateInput(e.target_date)||t.push({field:"target_date",message:"Invalid target_date format",severity:"critical",suggestion:'Use ISO date string (2025-12-31T23:59:59), entity ID (sensor.my_date), or template ({{ states("sensor.date") }}).',value:e.target_date}):e.timer_entity||e.auto_discover_alexa||e.auto_discover_google||"listy"===e.style&&Array.isArray(e.countdowns)&&e.countdowns.length||t.push({field:"target_date",message:'Either "target_date", "timer_entity", "auto_discover_alexa", or "auto_discover_google" must be provided',severity:"critical",suggestion:'Add target_date field with a valid date value like "2025-12-31T23:59:59" OR specify a timer_entity like "timer.my_timer" OR enable auto_discover_alexa OR enable auto_discover_google.',value:void 0}),e.timer_entity&&!this.isValidEntityId(e.timer_entity)&&t.push({field:"timer_entity",message:"Invalid timer_entity format",severity:"warning",suggestion:'Use a valid entity ID like "timer.my_timer", "sensor.alexa_timer", or "sensor.kitchen_display_timers" (Google Home).',value:e.timer_entity}),e.creation_date&&!this.isValidDateInput(e.creation_date)&&t.push({field:"creation_date",message:"Invalid creation_date format",severity:"warning",suggestion:"Use ISO date string, entity ID, or template. This field is optional.",value:e.creation_date}),e.count_up_goal_date&&!this.isValidDateInput(e.count_up_goal_date)&&t.push({field:"count_up_goal_date",message:"Invalid count_up_goal_date format",severity:"warning",suggestion:"Use ISO date string, entity ID, or template. This field is optional.",value:e.count_up_goal_date}),void 0===e.mode||["count_down","count_up"].includes(e.mode)||t.push({field:"mode",message:"Invalid mode value",severity:"warning",suggestion:'Use "count_down" or "count_up".',value:e.mode});const i="string"==typeof e.count_up_cycle&&(this.isTemplate(e.count_up_cycle)||this.isValidEntityId(e.count_up_cycle));void 0!==e.count_up_cycle&&!i&&He(e.count_up_cycle)<=0&&t.push({field:"count_up_cycle",message:"Invalid count_up_cycle format",severity:"warning",suggestion:'Use seconds, HH:MM:SS, or compact units like "30d", "12h", or "90m".',value:e.count_up_cycle});["text_color","background_color","progress_color"].forEach(i=>{e[i]&&!this.isValidColorInput(e[i])&&t.push({field:i,message:`Invalid ${i} format`,severity:"warning",suggestion:"Use hex (#ff0000), rgb/rgba, hsl/hsla, CSS color name, entity ID, or template.",value:e[i]})});["width","height","icon_size"].forEach(i=>{e[i]&&!this.isValidDimensionInput(e[i])&&t.push({field:i,message:`Invalid ${i} format`,severity:"warning",suggestion:"Use pixel values (100px), percentages (50%), or CSS units (2rem).",value:e[i]})}),e.aspect_ratio&&!this.isValidAspectRatioInput(e.aspect_ratio)&&t.push({field:"aspect_ratio",message:"Invalid aspect_ratio format",severity:"warning",suggestion:'Use format like "16/9", "4/3", or "1/1".',value:e.aspect_ratio}),void 0===e.stroke_width||this.isValidNumberInput(e.stroke_width,1,50)||t.push({field:"stroke_width",message:"Invalid stroke_width value",severity:"warning",suggestion:"Must be a number between 1 and 50.",value:e.stroke_width});["show_years","show_months","show_weeks","show_days","show_hours","show_minutes","show_seconds","expired_animation","show_progress_text","invert_progress"].forEach(i=>{void 0===e[i]||this.isValidBooleanInput(e[i])||t.push({field:i,message:`Invalid ${i} value`,severity:"warning",suggestion:"Must be true or false (boolean value).",value:e[i]})});["title","subtitle","expired_text"].forEach(i=>{e[i]&&!this.isValidTextInput(e[i])&&t.push({field:i,message:`Invalid ${i} - contains potentially unsafe content`,severity:"critical",suggestion:"Remove script tags, javascript: URLs, and event handlers for security.",value:e[i]})}),e.styles&&!this.isValidStylesInput(e.styles)&&t.push({field:"styles",message:"Invalid styles object structure",severity:"warning",suggestion:"Must contain valid style arrays for card, title, subtitle, or progress_circle.",value:e.styles}),this._addHelpfulValidations(e,t);const s=this._generateSafeConfig(e,t),r=t.filter(e=>"critical"===e.severity),o=t.filter(e=>"warning"===e.severity);return{isValid:0===r.length&&0===o.length,errors:t,hasCriticalErrors:r.length>0,hasWarnings:o.length>0,safeConfig:s}}static _addHelpfulValidations(e,t){}static _generateSafeConfig(e,t){const i={...e};return t.forEach(e=>{if("critical"===e.severity||"warning"===e.severity)switch(e.field){case"target_date":if(!(i.target_date||i.timer_entity||i.auto_discover_alexa||i.auto_discover_google)){const e=new Date;e.setDate(e.getDate()+1),i.target_date=e.toISOString()}break;case"background_color":this.isValidColorInput(i.background_color)||delete i.background_color;break;case"progress_color":this.isValidColorInput(i.progress_color)||(i.progress_color="#4caf50");break;case"stroke_width":this.isValidNumberInput(i.stroke_width,1,50)||(i.stroke_width=15);break;case"icon_size":this.isValidDimensionInput(i.icon_size)||(i.icon_size=100);break;case"mode":i.mode="count_down";break;case"count_up_goal_date":this.isValidDateInput(i.count_up_goal_date)||delete i.count_up_goal_date;break;case"count_up_cycle":He(i.count_up_cycle)<=0&&delete i.count_up_cycle}}),i}static validateConfigLegacy(e){const t=this.validateConfig(e);if(t.hasCriticalErrors){const e=t.errors.filter(e=>"critical"===e.severity);throw new Error(`Configuration validation failed:\n• ${e.map(e=>e.message).join("\n• ")}`)}}static isValidDateInput(e){if(!e)return!1;if(this.isTemplate(e))return!0;if("string"==typeof e&&e.includes("."))return!0;if("string"==typeof e)try{const t=new Date(e);return!isNaN(t.getTime())}catch(pe){return!1}return!1}static isValidColorInput(e){if(!e)return!1;if(this.isTemplate(e)||"string"==typeof e&&e.includes("."))return!0;if("string"!=typeof e)return!1;if(/^#([0-9A-F]{3}){1,2}$/i.test(e))return!0;if(/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/i.test(e))return!0;if(/^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(,\s*[\d.]+\s*)?\)$/i.test(e))return!0;return["red","blue","green","yellow","orange","purple","pink","brown","black","white","gray","grey","cyan","magenta","lime","maroon","navy","olive","teal","silver","gold","indigo","violet","transparent","currentColor","inherit","initial","unset"].includes(e.toLowerCase())}static isValidDimensionInput(e){if(!e)return!1;if(this.isTemplate(e)||"string"==typeof e&&e.includes("."))return!0;if("number"==typeof e)return!0;if("string"!=typeof e)return!1;const t=e.match(/^(\d+(?:\.\d+)?)px$/i);if(t){const e=parseFloat(t[1]);return e>=0&&e<=1e4}const i=e.match(/^(\d+(?:\.\d+)?)%$/i);if(i){const e=parseFloat(i[1]);return e>=0&&e<=1e3}const s=["em","rem","vh","vw","vmin","vmax","ch","ex"];for(const r of s){const t=new RegExp(`^(\\d+(?:\\.\\d+)?)${r}$`,"i"),i=e.match(t);if(i){const e=parseFloat(i[1]);return e>=0&&e<=1e3}}return["auto","fit-content","min-content","max-content"].includes(e.toLowerCase())}static isValidAspectRatioInput(e){if(!e)return!1;if(this.isTemplate(e)||"string"==typeof e&&e.includes("."))return!0;if("string"!=typeof e)return!1;const t=e.match(/^(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);if(t){const e=parseFloat(t[1]),i=parseFloat(t[2]);return e>0&&i>0&&e<=20&&i<=20}return!1}static isValidNumberInput(e,t=-1/0,i=1/0){if(null==e)return!1;if("string"==typeof e){if(this.isTemplate(e)||e.includes("."))return!0;const s=parseFloat(e);return!isNaN(s)&&s>=t&&s<=i}return"number"==typeof e&&!isNaN(e)&&e>=t&&e<=i}static isValidBooleanInput(e){return"boolean"==typeof e}static isValidTextInput(e){if(!e)return!0;if(this.isTemplate(e)||"string"==typeof e&&e.includes("."))return!0;if("string"!=typeof e)return!1;return![/<script/i,/javascript:/i,/vbscript:/i,/on\w+\s*=/i,/<iframe/i,/<object/i,/<embed/i,/<form/i].some(t=>t.test(e))}static isValidStylesInput(e){if(!e||"object"!=typeof e)return!1;const t=["card","title","subtitle","progress_circle"],i=Object.keys(e);return!!i.every(e=>t.includes(e))&&i.every(t=>Array.isArray(e[t]))}static isTemplate(e){return"string"==typeof e&&(!(!e.includes("{{")||!e.includes("}}"))||e.includes("{%")&&e.includes("%}"))}static isValidEntityId(e){if(!e||"string"!=typeof e)return!1;if(this.isTemplate(e))return!0;return/^[a-z_]+\.[a-z0-9_]+$/.test(e)}}const Ve=(e,t,i)=>e.subscribeMessage(e=>t(e),{type:"render_template",...i});const je=new class{constructor(e){this._cache=new Map,this._expiration=e}get(e){return this._cache.get(e)}set(e,t){this._cache.set(e,t),this._expiration&&window.setTimeout(()=>this._cache.delete(e),this._expiration)}has(e){return this._cache.has(e)}delete(e){return this._cache.delete(e)}clear(){this._cache.clear()}}(6e4);class We{constructor(){this._unsubRenderTemplates=new Map,this._templateResults=new Map,this._connected=!1,this._staticEntityReads=new Set}connect(){this._connected=!0,this._templateResults.forEach((e,t)=>{je.has(t)&&this._templateResults.set(t,je.get(t))})}async disconnect(){this._connected=!1,await this._unsubscribeAll()}async _unsubscribeAll(){this._templateResults.forEach((e,t)=>{je.set(t,e)});for(const[,t]of this._unsubRenderTemplates.entries())try{(await t)()}catch(e){"not_found"!==e.code&&"template_error"!==e.code&&console.warn("[TimeFlow] Error unsubscribing from template:",e)}this._unsubRenderTemplates.clear()}async _subscribeToTemplate(e){var t,i,s;const r=null===(t=this.card)||void 0===t?void 0:t.hass;if(r&&r.connection&&this._connected&&!this._unsubRenderTemplates.has(e)){je.has(e)&&this._templateResults.set(e,je.get(e));try{const t=Ve(r.connection,t=>{this._templateResults.set(e,t),je.set(e,t);const i=this.card;(null==i?void 0:i.requestRecompute)?i.requestRecompute():(null==i?void 0:i.requestUpdate)&&i.requestUpdate()},{template:e,variables:{user:null!==(s=null===(i=r.user)||void 0===i?void 0:i.name)&&void 0!==s?s:"User"},strict:!0});this._unsubRenderTemplates.set(e,t),await t}catch(o){const t=this.extractFallbackFromTemplate(e);this._templateResults.set(e,{result:t,listeners:{all:!1,domains:[],entities:[],time:!1}}),this._unsubRenderTemplates.delete(e)}}}async unsubscribeFromTemplate(e){const t=this._unsubRenderTemplates.get(e);if(t)try{(await t)(),this._unsubRenderTemplates.delete(e),this._templateResults.delete(e)}catch(i){"not_found"!==i.code&&"template_error"!==i.code&&console.warn("[TimeFlow] Error unsubscribing from template:",i)}}async evaluateTemplate(e,t){var i,s;if(!e)return e;if(this._connected&&(null===(s=null===(i=this.card)||void 0===i?void 0:i.hass)||void 0===s?void 0:s.connection)&&await this._subscribeToTemplate(e),this._templateResults.has(e))return this._templateResults.get(e).result;if(je.has(e)){const t=je.get(e);return this._templateResults.set(e,t),t.result}return this.extractFallbackFromTemplate(e)}extractFallbackFromTemplate(e){if(!e||"string"!=typeof e)return e;try{if(e.includes("{%"))return"Unavailable";const t=e.replace(/^\{\{\s*/,"").replace(/\s*\}\}$/,"").trim(),i=/^(.+?)\s+or\s+['"`]([^'"`]+)['"`]$/,s=t.match(i);if(s&&s[2])return s[2];const r=/^(.+?)\s+or\s+(.+?)\s+or\s+['"`]([^'"`]+)['"`]$/,o=t.match(r);if(o&&o[3])return o[3];const a=/^['"`]([^'"`]+)['"`]\s+if\s+(.+?)\s+else\s+['"`]([^'"`]+)['"`]$/,n=t.match(a);if(n&&n[3])return n[3];const l=/^(.+?)\s+if\s+(.+?)\s+else\s+['"`]([^'"`]+)['"`]$/,c=t.match(l);return c&&c[3]?c[3]:"Unavailable"}catch(t){return"Template Error"}}isTemplate(e){return"string"==typeof e&&(!(!e.includes("{{")||!e.includes("}}"))||e.includes("{%")&&e.includes("%}"))}isValidTemplate(e){if(!e||"string"!=typeof e)return!1;if(!this.isTemplate(e))return!1;if((e.match(/\{\{/g)||[]).length!==(e.match(/\}\}/g)||[]).length)return!1;if((e.match(/\{%/g)||[]).length!==(e.match(/%\}/g)||[]).length)return!1;return!!e.replace(/\{\{\s*/,"").replace(/\s*\}\}/,"").trim()}resolveStaticValue(e){var t;if(!e)return;const i=null===(t=this.card)||void 0===t?void 0:t.hass;if("string"==typeof e&&e.includes(".")&&i&&i.states[e]){const t=i.states[e];if(!t)return;return this._staticEntityReads.add(e),t.state}return e}getEntityDependencies(){const e=new Set(this._staticEntityReads);let t=!1;return this._templateResults.forEach(i=>{const s=null==i?void 0:i.listeners;s?((s.all||s.domains&&s.domains.length>0)&&(t=!0),Array.isArray(s.entities)&&s.entities.forEach(t=>e.add(t))):t=!0}),{entities:Array.from(e),watchAll:t}}async resolveValue(e){var t;if(e){if(this.isTemplate(e)){const i=(null===(t=this.card)||void 0===t?void 0:t.hass)||null;return await this.evaluateTemplate(e,i)||void 0}return this.resolveStaticValue(e)}}clearTemplateCache(){this._unsubscribeAll(),this._templateResults.clear(),this._staticEntityReads.clear()}hasTemplatesInConfig(e){if(!e)return!1;return["target_date","creation_date","title","subtitle","color","background_color","progress_color"].some(t=>e[t]&&this.isTemplate(e[t]))}escapeHtml(e){return null==e||void 0===e?"":String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}}class qe{constructor(e,t){this._totalDurationMs=0,this._watchedEntities=new Set,this._passTimerSource=null,this.templateService=e,this.dateParser=t,this.timeRemaining={years:0,months:0,weeks:0,days:0,hours:0,minutes:0,seconds:0,total:0},this.expired=!1,this.lastAlexaTimerData=null}_getMode(e){return"count_up"===e.mode?"count_up":"count_down"}_buildZeroState(){return{years:0,months:0,weeks:0,days:0,hours:0,minutes:0,seconds:0,total:0}}_calculateRangeState(e,t,i,s){if(t<=e)return this._buildZeroState();const{show_years:r,show_months:o,show_weeks:a,show_days:n,show_hours:l,show_minutes:c,show_seconds:d}=i,u=s&&!!n&&!l&&!c&&!d;let h=0,m=0,p=0,_=0,g=0,f=0,y=0,v=t-e;const b=new Date(e),w=new Date(t);if(r){const e=this._calculateCalendarYears(b,w);h=e.years,v=e.remainingMs,b.setFullYear(b.getFullYear()+h)}if(o){const e=this._calculateCalendarMonths(b,w);m=e.months,v=e.remainingMs}else if(r&&!o){const e=this._calculateCalendarYears(b,w);h+=e.years,v=e.remainingMs,b.setFullYear(b.getFullYear()+e.years)}if(a&&(p=Math.floor(v/Re),v%=Re),n)_=Math.floor(v/Ne),v%=Ne;else if((r||o||a)&&!n){const e=Math.floor(v/Ne);a&&(p+=Math.floor(e/7),v-=7*Math.floor(e/7)*Ne)}if(u&&v>0&&(_+=1,v=0),l)g=Math.floor(v/Ie),v%=Ie;else if((r||o||a||n)&&!l){const e=Math.floor(v/Ie),t=Math.floor(e/24);n?(_+=t,v-=t*Ne):a&&(_+=t,p+=Math.floor(_/7),_%=7,v-=t*Ne)}if(c)f=Math.floor(v/De),v%=De;else if((r||o||a||n||l)&&!c){const e=Math.floor(v/De);if(l){const t=Math.floor(e/ze);g+=t,v-=t*Ie}else if(n){const t=Math.floor(e/1440);_+=t,v-=t*Ne}}if(d)y=Math.floor(v/Ee);else if((r||o||a||n||l||c)&&!d){const e=Math.floor(v/Ee);c?f+=Math.floor(e/ze):l?g+=Math.floor(e/Pe):n&&(_+=s?Math.ceil(e/86400):Math.floor(e/86400))}return{years:h,months:m,weeks:p,days:_,hours:g,minutes:f,seconds:y,total:t-e}}_calculateCalendarMonths(e,t){if(t<=e)return{months:0,remainingMs:0};let i=0;const s=new Date(e);for(;;){const e=new Date(s);if(e.setMonth(e.getMonth()+1),!(e<=t))break;i++,s.setMonth(s.getMonth()+1)}return{months:i,remainingMs:t.getTime()-s.getTime()}}_calculateCalendarYears(e,t){if(t<=e)return{years:0,remainingMs:0};let i=0;const s=new Date(e);for(;;){const e=new Date(s);if(e.setFullYear(e.getFullYear()+1),!(e<=t))break;i++,s.setFullYear(s.getFullYear()+1)}return{years:i,remainingMs:t.getTime()-s.getTime()}}_resolveTimerSource(e,t){if(this._passTimerSource)return this._passTimerSource;let i=null,s=null;return e.timer_entity&&t&&(this._watchedEntities.add(e.timer_entity),i=Me.getTimerData(e.timer_entity,t)),!i&&t&&(s=this._findBestSmartTimer(e,t)),this._passTimerSource={timerData:i,smartTimer:s},this._passTimerSource}beginPass(){this._passTimerSource=null,this._watchedEntities.clear(),this.timeRemaining=this._buildZeroState(),this.expired=!1}getWatchedEntities(){return Array.from(this._watchedEntities)}noteWatchedEntity(e){e&&this._watchedEntities.add(e)}listAllTimers(e,t){if(!t)return[];const i=[];if(e.timer_entity)i.push(e.timer_entity);else{const s=e=>this._watchedEntities.add(e);e.auto_discover_alexa&&i.push(...Me.discoverAlexaTimers(t,s)),e.auto_discover_google&&i.push(...Me.discoverGoogleTimers(t,s))}const s=[],r=new Set;for(const a of i)r.has(a)||(r.add(a),this._watchedEntities.add(a),s.push(...Me.listTimers(a,t)));s.sort(qe.compareTimersForDisplay);const o=qe.resolveMaxTimers(e);return s.length>o?s.slice(0,o):s}static compareTimersForDisplay(e,t){const i=e=>e.finished?0:e.isActive?1:2,s=i(e)-i(t);if(0!==s)return s;if(e.remaining!==t.remaining)return e.remaining-t.remaining;const r=e.userDefinedLabel||e.deviceName||"",o=t.userDefinedLabel||t.deviceName||"";return r.localeCompare(o)}static resolveMaxTimers(e){const t=Number(e.max_timers);return Number.isFinite(t)?Math.min(20,Math.max(1,Math.floor(t))):5}_findBestSmartTimer(e,t){if(e.timer_entity)return null;if(!e.auto_discover_alexa&&!e.auto_discover_google)return null;const i=[],s=e=>this._watchedEntities.add(e);if(e.auto_discover_alexa&&i.push(...Me.discoverAlexaTimers(t,s)),e.auto_discover_google&&i.push(...Me.discoverGoogleTimers(t,s)),0===i.length)return null;const r=[e=>e.isActive,e=>e.isPaused,e=>!!e.finished];for(const o of r){const e=i.find(e=>{const i=Me.getTimerData(e,t);return i&&o(i)});if(e){const i=Me.getTimerData(e,t);if(i)return{entityId:e,timerData:i}}}return null}async updateCountdown(e,t){try{const i=this._getMode(e),{timerData:s,smartTimer:r}=this._resolveTimerSource(e,t);if(e.timer_entity&&t&&s)return this.timeRemaining=this._timerDataToCountdownState(s),this.expired=Me.isTimerExpired(s),this.timeRemaining;if(t){if(r)return this.lastAlexaTimerData=r.timerData,this.timeRemaining=this._timerDataToCountdownState(r.timerData),this.expired=Me.isTimerExpired(r.timerData),this.timeRemaining;if(e.auto_discover_alexa||e.auto_discover_google)return this.lastAlexaTimerData&&Me.isTimerExpired(this.lastAlexaTimerData)?(this.timeRemaining=this._timerDataToCountdownState(this.lastAlexaTimerData),this.expired=!0,this.timeRemaining):(this.lastAlexaTimerData=null,this.timeRemaining={years:0,months:0,weeks:0,days:0,hours:0,minutes:0,seconds:0,total:0},this.expired=!1,this.timeRemaining)}if(!e.target_date)return this.timeRemaining;const o=(new Date).getTime(),a=await this.templateService.resolveValue(e.target_date);if(!a)return this.timeRemaining;const n=this.dateParser.parseISODate(a);return isNaN(n)||("count_up"===i?(this.timeRemaining=o>n?this._calculateRangeState(n,o,e,!1):this._buildZeroState(),this.expired=!1):n>o?(this.timeRemaining=this._calculateRangeState(o,n,e,!0),this.expired=!1):(this.timeRemaining=this._buildZeroState(),this.expired=!0)),this.timeRemaining}catch(i){return this.timeRemaining}}async calculateProgress(e,t){const i=this._getMode(e);this._totalDurationMs=0;const{timerData:s,smartTimer:r}=this._resolveTimerSource(e,t);if(e.timer_entity&&t)return s?(this._totalDurationMs=Math.max(0,1e3*(s.duration||0)),s.progress):0;if(t&&r)return this._totalDurationMs=Math.max(0,1e3*(r.timerData.duration||0)),r.timerData.progress;const o=await this.templateService.resolveValue(e.target_date);if(!o)return 0;const a=this.dateParser.parseISODate(o),n=Date.now();if("count_up"===i){if(isNaN(a)||n<=a)return 0;const t=n-a;if(e.count_up_goal_date){const i=await this.templateService.resolveValue(e.count_up_goal_date),s=this.dateParser.parseISODate(i);if(!isNaN(s)&&s>a){const e=s-a;return this._totalDurationMs=e,Math.min(100,Math.max(0,t/e*100))}}let i=e.count_up_cycle;"string"==typeof i&&(i=await this.templateService.resolveValue(i));const s=He(i);if(s>0){this._totalDurationMs=s;const e=t%s;return Math.min(100,Math.max(0,e/s*100))}return 0}let l;if(e.creation_date){const t=await this.templateService.resolveValue(e.creation_date);l=t?this.dateParser.parseISODate(t):n}else l=n;const c=a-l;if(c<=0)return 100;this._totalDurationMs=c;const d=n-l,u=Math.min(100,Math.max(0,d/c*100));return this.expired?100:u}getPrimaryDisplayUnit(e){const{years:t,months:i,weeks:s,days:r,hours:o,minutes:a,seconds:n,total:l}=this.timeRemaining||this._buildZeroState(),{show_years:c,show_months:d,show_weeks:u,show_days:h,show_hours:m,show_minutes:p,show_seconds:_}=e;if(!1!==c&&t>0)return{value:t,unit:"year"};if(!1!==d&&i>0)return{value:i,unit:"month"};if(!1!==u&&s>0)return{value:s,unit:"week"};if(!1!==h&&r>0)return{value:r,unit:"day"};if(!1!==m&&o>0)return{value:o,unit:"hour"};if(!1!==p&&a>0)return{value:a,unit:"minute"};if(!1!==_&&n>0)return{value:n,unit:"second"};const g=l||0;if(g<=0)return{value:0,unit:!1!==_?"second":"day"};const f=(y=g)<=0?{days:0,hours:0,minutes:0,seconds:0}:{days:Math.floor(y/Ne),hours:Math.floor(y%Ne/Ie),minutes:Math.floor(y%Ie/De),seconds:Math.floor(y%De/Ee)};var y;return f.days>0?{value:f.days,unit:"day"}:f.hours>0?{value:f.hours,unit:"hour"}:f.minutes>0?{value:f.minutes,unit:"minute"}:f.seconds>0?{value:f.seconds,unit:"second"}:{value:0,unit:"second"}}getMainDisplay(e,t){const i=this._getMode(e),s="count_up"===i?"timer":"mainDisplay",{timerData:r,smartTimer:o}=this._resolveTimerSource(e,null!=t?t:null);if(e.timer_entity&&t&&r){const{hours:e,minutes:t,seconds:i}=this.timeRemaining;return r.isAlexaTimer||r.isGoogleTimer?Me.isTimerExpired(r)?{value:"🔔",label:Me.getTimerSubtitle(r,!1)}:e>0?{value:e.toString(),label:Le("hour",e,s)}:t>0?{value:t.toString(),label:Le("minute",t,s)}:{value:i.toString(),label:Le("second",i,s)}:e>0?{value:e.toString(),label:Le("hour",e,"timer")}:t>0?{value:t.toString(),label:Le("minute",t,"timer")}:{value:i.toString(),label:Le("second",i,"timer")}}if(t){if(o){const{timerData:e}=o;this.lastAlexaTimerData=e,this.timeRemaining=this._timerDataToCountdownState(e);const{hours:t,minutes:i,seconds:r}=this.timeRemaining;return Me.isTimerExpired(e)?{value:"🔔",label:Me.getTimerSubtitle(e,!1)}:t>0?{value:t.toString(),label:Le("hour",t,s)}:i>0?{value:i.toString(),label:Le("minute",i,s)}:{value:r.toString(),label:Le("second",r,s)}}if((e.auto_discover_alexa||e.auto_discover_google)&&this.lastAlexaTimerData&&Me.isTimerExpired(this.lastAlexaTimerData))return{value:"🔔",label:Me.getTimerSubtitle(this.lastAlexaTimerData,!1)}}if("count_up"!==i&&this.expired)return e.auto_discover_alexa||e.auto_discover_google?this.lastAlexaTimerData?{value:"🔔",label:Me.getTimerSubtitle(this.lastAlexaTimerData,!1)}:{value:"🔔",label:"Timer complete"}:{value:"Done",label:"Completed!"};const a=this.getPrimaryDisplayUnit(e);return{value:a.value.toString(),label:Le(a.unit,a.value,s)}}getSubtitle(e,t,i,s=!0){var r;const o=i||(e=>e),a=this._getMode(e),{timerData:n,smartTimer:l}=this._resolveTimerSource(e,t);if(e.timer_entity&&t)return n?(n.isAlexaTimer||n.isGoogleTimer,Me.getTimerSubtitle(n,!1!==e.show_seconds,i,s)):"Timer not found";if(t){if(l){const{timerData:t}=l;return this.lastAlexaTimerData=t,this.timeRemaining=this._timerDataToCountdownState(t),Me.getTimerSubtitle(t,!1!==e.show_seconds,i,s)}if(e.auto_discover_alexa||e.auto_discover_google)return this.lastAlexaTimerData&&Me.isTimerExpired(this.lastAlexaTimerData)?Me.getTimerSubtitle(this.lastAlexaTimerData,!1!==e.show_seconds,i,s):o("timer.no_timers")}if("count_up"!==a&&this.expired){const{expired_text:t=o("countdown.completed")}=e;return t}const{years:c,months:d,weeks:u,days:h,hours:m,minutes:p,seconds:_}=this.timeRemaining||{years:0,months:0,weeks:0,days:0,hours:0,minutes:0,seconds:0},{show_years:g,show_months:f,show_weeks:y,show_days:v,show_hours:b,show_minutes:w,show_seconds:x,compact_format:$,subtitle_prefix:S,subtitle_suffix:T}=e,C=[];g&&c>0&&C.push({value:c,unit:o(1===c?"time.year_full":"time.years_full")}),f&&d>0&&C.push({value:d,unit:o(1===d?"time.month_full":"time.months_full")}),y&&u>0&&C.push({value:u,unit:o(1===u?"time.week_full":"time.weeks_full")}),v&&h>0&&C.push({value:h,unit:o(1===h?"time.day_full":"time.days_full")}),b&&m>0&&C.push({value:m,unit:o(1===m?"time.hour_full":"time.hours_full")}),w&&p>0&&C.push({value:p,unit:o(1===p?"time.minute_full":"time.minutes_full")}),x&&_>0&&C.push({value:_,unit:o(1===_?"time.second_full":"time.seconds_full")});const k=e=>`${S?`${S} `:""}${e}${T?` ${T}`:""}`;if(0===C.length){if(((null===(r=this.timeRemaining)||void 0===r?void 0:r.total)||0)>0){const t=this.getPrimaryDisplayUnit(e),i={year:[o("time.year_full"),o("time.years_full")],month:[o("time.month_full"),o("time.months_full")],week:[o("time.week_full"),o("time.weeks_full")],day:[o("time.day_full"),o("time.days_full")],hour:[o("time.hour_full"),o("time.hours_full")],minute:[o("time.minute_full"),o("time.minutes_full")],second:[o("time.second_full"),o("time.seconds_full")]},[s,r]=i[t.unit];return k(`${t.value} ${1===t.value?s:r}`)}return x?k(`0 ${o("time.seconds_full")}`):o("countdown.starting")}if(1===C.length)return k(`${C[0].value} ${C[0].unit}`);if(!0===$||!1!==$&&C.length>=3){const e=C.map(e=>`${e.value}${e.unit.charAt(0)}`).join(" ");return k(e)}return k(C.map(e=>`${e.value} ${e.unit}`).join(" "))}_timerDataToCountdownState(e){const t=(i=e.remaining)<=0?{days:0,hours:0,minutes:0,seconds:0}:{days:Math.floor(i/86400),hours:Math.floor(i%86400/Pe),minutes:Math.floor(i%Pe/ze),seconds:Math.floor(i%ze)};var i;return{years:0,months:0,weeks:0,days:t.days,hours:t.hours,minutes:t.minutes,seconds:t.seconds,total:e.remaining*Ee}}getTotalDurationMs(){return this._totalDurationMs}getTimeRemaining(){return this.timeRemaining}isExpired(){return this.expired}getAvailableAlexaTimers(e){return e?Me.discoverAlexaTimers(e):[]}getAvailableGoogleTimers(e){return e?Me.discoverGoogleTimers(e):[]}getCurrentTimerEntity(e,t){if(e.timer_entity)return e.timer_entity;if((e.auto_discover_alexa||e.auto_discover_google)&&t){let i=[];if(e.auto_discover_alexa){const e=Me.discoverAlexaTimers(t);i.push(...e)}if(e.auto_discover_google){const e=Me.discoverGoogleTimers(t);i.push(...e)}if(i.length>0){for(const e of i){const i=Me.getTimerData(e,t);if(i&&i.isActive)return e}return i[0]}}return null}}class Be{constructor(){this.cache={dynamicIconSize:null,dynamicStrokeWidth:null,customStyles:null,lastConfigHash:null}}processStyles(e){return e&&Array.isArray(e)?e.map(e=>{try{return"string"==typeof e?e:"object"==typeof e&&null!==e?Object.entries(e).map(([e,t])=>`${e}: ${t}`).join("; "):""}catch(pe){return""}}).join("; "):""}buildStylesObject(e){const t=JSON.stringify(e.styles||{});if(null!==this.cache.customStyles&&this.cache.lastConfigHash===t)return this.cache.customStyles;const{styles:i={}}=e;try{const e={card:this.processStyles(i.card),title:this.processStyles(i.title),subtitle:this.processStyles(i.subtitle),progress_circle:this.processStyles(i.progress_circle)};return this.cache.customStyles=e,this.cache.lastConfigHash=t,e}catch(pe){return this.cache.customStyles={card:"",title:"",subtitle:"",progress_circle:""},this.cache.customStyles}}_getCardDimensions(e,t,i){const s=300,r=150;let o=s,a=r;if(e&&t){o=this.parseDimension(e)||s,a=this.parseDimension(t)||r}else if(e&&i){o=this.parseDimension(e)||s;const[t,r]=i.split("/").map(parseFloat);!isNaN(t)&&!isNaN(r)&&t>0&&(a=o*(r/t))}else if(t&&i){a=this.parseDimension(t)||r;const[e,s]=i.split("/").map(parseFloat);!isNaN(e)&&!isNaN(s)&&s>0&&(o=a*(e/s))}else if(i){const[e,t]=i.split("/").map(parseFloat);!isNaN(e)&&!isNaN(t)&&e>0&&(a=s*(t/e)),o=s}return(!o||isNaN(o)||o<=0)&&(o=s),(!a||isNaN(a)||a<=0)&&(a=r),{cardWidth:o,cardHeight:a}}calculateDynamicIconSize(e,t,i,s){const r=JSON.stringify({width:e,height:t,aspect_ratio:i,icon_size:s});if(null!==this.cache.dynamicIconSize&&this.cache.lastIconConfigHash===r)return this.cache.dynamicIconSize;try{const{cardWidth:o,cardHeight:a}=this._getCardDimensions(e,t,i),n=.4*Math.min(o,a);let l=n;if(s&&"100px"!==s){const e="string"==typeof s?parseInt(s.replace("px","")):"number"==typeof s?s:n;l=isNaN(e)?n:e}return this.cache.dynamicIconSize=Math.max(Be.MIN_ICON_SIZE,Math.min(l,Be.MAX_ICON_SIZE)),this.cache.lastIconConfigHash=r,this.cache.dynamicIconSize}catch(o){return this.cache.dynamicIconSize=Be.MIN_ICON_SIZE,this.cache.dynamicIconSize}}calculateDynamicStrokeWidth(e,t){const i=JSON.stringify({iconSize:e,stroke_width:t});if(null!==this.cache.dynamicStrokeWidth&&this.cache.lastStrokeConfigHash===i)return this.cache.dynamicStrokeWidth;try{if(t&&"number"==typeof t)this.cache.dynamicStrokeWidth=Math.max(Be.MIN_STROKE,Math.min(t,Be.MAX_STROKE));else{const t=.15,i=Math.round(e*t);this.cache.dynamicStrokeWidth=Math.max(Be.MIN_STROKE,Math.min(i,Be.MAX_STROKE))}return this.cache.lastStrokeConfigHash=i,this.cache.dynamicStrokeWidth}catch(s){return this.cache.dynamicStrokeWidth=Be.MIN_STROKE,this.cache.dynamicStrokeWidth}}calculateProportionalSizes(e,t,i){try{const{cardWidth:s,cardHeight:r}=this._getCardDimensions(e,t,i),o=45e3,a=Math.sqrt(s*r/o);return{titleSize:Math.max(1.2,Math.min(2.2,1.6*a)),subtitleSize:Math.max(.9,Math.min(1.4,1.1*a)),cardWidth:s,cardHeight:r}}catch(s){return{titleSize:1.6,subtitleSize:1.1,cardWidth:300,cardHeight:150}}}parseDimension(e){try{if("number"==typeof e)return e;if("string"!=typeof e)return null;const t=e.toLowerCase();if(t.includes("%")){const e=parseFloat(t.replace("%",""));return isNaN(e)?null:e/100*300}if(t.includes("px")){const e=parseFloat(t.replace("px",""));return isNaN(e)?null:e}const i=parseFloat(t);return isNaN(i)?null:i}catch(t){return null}}generateCardDimensionStyles(e,t,i){const s=[];if(e){const t=this._formatDimensionValue(e);t&&s.push(`width: ${t}`)}if(t){const e=this._formatDimensionValue(t);e&&s.push(`height: ${e}`)}else i&&!t&&s.push(`aspect-ratio: ${i}`);return t||i||s.push("min-height: 120px"),s}_formatDimensionValue(e){if(!e)return null;const t=String(e).trim();if(/^[\d.]+\s*(px|%|em|rem|vh|vw|vmin|vmax|ch|ex)$/i.test(t))return t;const i=parseFloat(t);return isNaN(i)?null:`${i}px`}clearCache(){this.cache={dynamicIconSize:null,dynamicStrokeWidth:null,customStyles:null,lastConfigHash:null}}getCardDimensions(e,t,i){return this._getCardDimensions(e,t,i)}}Be.MIN_ICON_SIZE=40,Be.MAX_ICON_SIZE=300,Be.MIN_STROKE=4,Be.MAX_STROKE=50;const Ye={en:{timer:{complete:"Timer complete",complete_with_label:"{label} timer complete",paused:"Paused",paused_with_time:"{label} timer paused - {time} left",paused_without_label:"Timer paused - {time} left",paused_alexa:"Timer paused on {device} - {time} left",ready:"Ready",ready_with_time:"Ready - {time}",no_timers:"No timers",list_quiet:"All quiet across devices",no_timers_device:"No timers on {device}",no_timers_google:"No Google Home timers",remaining:"{time} remaining",remaining_with_label:"{time} remaining on {label} timer",remaining_with_device:"{time} remaining on {device}",paused_time_left:"Timer paused - {time} left",google_paused:"Google Home timer paused - {time} left",timer_ready:"Timer ready"},countdown:{starting:"Starting...",completed:"Completed!"},time:{hour_compact:"h",day_compact:"d",week_compact:"w",month_compact:"mo",year_compact:"y",minute_compact:"m",second_compact:"s",hour_full:"hour",hours_full:"hours",day_full:"day",days_full:"days",week_full:"week",weeks_full:"weeks",month_full:"month",months_full:"months",year_full:"year",years_full:"years",minute_full:"minute",minutes_full:"minutes",second_full:"second",seconds_full:"seconds",year_eventy:"YEAR",years_eventy:"YEARS",month_eventy:"MONTH",months_eventy:"MONTHS",week_eventy:"WEEK",weeks_eventy:"WEEKS",day_eventy:"DAY",days_eventy:"DAYS",hour_eventy:"HOUR",hours_eventy:"HOURS",minute_eventy:"MIN",minutes_eventy:"MINS",second_eventy:"SEC",seconds_eventy:"SECS"}},fr:{timer:{complete:"Minuteur terminé",complete_with_label:"Minuteur {label} terminé",paused:"En pause",paused_with_time:"Minuteur {label} en pause - {time} restant",paused_without_label:"Minuteur en pause - {time} restant",paused_alexa:"Minuteur en pause sur {device} - {time} restant",ready:"Prêt",ready_with_time:"Prêt - {time}",no_timers:"Aucun minuteur",no_timers_device:"Aucun minuteur sur {device}",no_timers_google:"Aucun minuteur Google Home",remaining:"{time} restant",remaining_with_label:"{time} restant sur le minuteur {label}",remaining_with_device:"{time} restant sur {device}",paused_time_left:"Minuteur en pause - {time} restant",google_paused:"Minuteur Google Home en pause - {time} restant",timer_ready:"Minuteur prêt"},countdown:{starting:"Démarrage...",completed:"Terminé!"},time:{hour_compact:"h",day_compact:"j",week_compact:"sem",month_compact:"mo",year_compact:"a",minute_compact:"min",second_compact:"s",hour_full:"heure",hours_full:"heures",day_full:"jour",days_full:"jours",week_full:"semaine",weeks_full:"semaines",month_full:"mois",months_full:"mois",year_full:"an",years_full:"ans",minute_full:"minute",minutes_full:"minutes",second_full:"seconde",seconds_full:"secondes",year_eventy:"AN",years_eventy:"ANS",month_eventy:"MOIS",months_eventy:"MOIS",week_eventy:"SEM",weeks_eventy:"SEM",day_eventy:"JOUR",days_eventy:"JOURS",hour_eventy:"HEURE",hours_eventy:"HEURES",minute_eventy:"MIN",minutes_eventy:"MINS",second_eventy:"SEC",seconds_eventy:"SECS"}},de:{timer:{complete:"Timer abgelaufen",complete_with_label:"Timer {label} abgelaufen",paused:"Pausiert",paused_with_time:"Timer {label} pausiert - {time} verbleibend",paused_without_label:"Timer pausiert - {time} verbleibend",paused_alexa:"Timer pausiert auf {device} - {time} verbleibend",ready:"Bereit",ready_with_time:"Bereit - {time}",no_timers:"Keine Timer",no_timers_device:"Keine Timer auf {device}",no_timers_google:"Keine Google Home Timer",remaining:"{time} verbleibend",remaining_with_label:"{time} verbleibend bei Timer {label}",remaining_with_device:"{time} verbleibend auf {device}",paused_time_left:"Timer pausiert - {time} verbleibend",google_paused:"Google Home Timer pausiert - {time} verbleibend",timer_ready:"Timer bereit"},countdown:{starting:"Startet...",completed:"Abgeschlossen!"},time:{hour_compact:"Std",day_compact:"T",week_compact:"W",month_compact:"Mon",year_compact:"J",minute_compact:"Min",second_compact:"s",hour_full:"Stunde",hours_full:"Stunden",day_full:"Tag",days_full:"Tage",week_full:"Woche",weeks_full:"Wochen",month_full:"Monat",months_full:"Monate",year_full:"Jahr",years_full:"Jahre",minute_full:"Minute",minutes_full:"Minuten",second_full:"Sekunde",seconds_full:"Sekunden",year_eventy:"JAHR",years_eventy:"JAHRE",month_eventy:"MONAT",months_eventy:"MONATE",week_eventy:"WOCHE",weeks_eventy:"WOCHEN",day_eventy:"TAG",days_eventy:"TAGE",hour_eventy:"STD",hours_eventy:"STD",minute_eventy:"MIN",minutes_eventy:"MIN",second_eventy:"SEK",seconds_eventy:"SEK"}},dk:{timer:{complete:"Tid fuldført",complete_with_label:"Timer {label} Tid fuldført",paused:"Pause",paused_with_time:"Timer {label} pause - {time} tid tilbage",paused_without_label:"tid på pause - {time} tid tilbage",paused_alexa:"Tid pause på {device} - {time} tid tilbage",ready:"Klar",ready_with_time:"Klar - {time}",no_timers:"Ingen tid",no_timers_device:"Ingen tid på {device}",no_timers_google:"Ingen tid på Google Home",remaining:"{time} tid tilbage",remaining_with_label:"{time} tid tilbage på {label}",remaining_with_device:"{time} tid tilbage på {device}",paused_time_left:"Timeout - {time} verbleibend",google_paused:"Google Home er på pause - {time} venstre",timer_ready:"Tid klar"},countdown:{starting:"Starter...",completed:"Færdig"},time:{hour_compact:"T",day_compact:"D",week_compact:"U",month_compact:"Man",year_compact:"År",minute_compact:"Min",second_compact:"S",hour_full:"Dag",hours_full:"Dage",day_full:"Dag",days_full:"Dage",week_full:"Uge",weeks_full:"Uger",month_full:"Månede",months_full:"Måneder",year_full:"År",years_full:"År",minute_full:"Minut",minutes_full:"Minutter",second_full:"Sekund",seconds_full:"Sekunder",year_eventy:"ÅR",years_eventy:"ÅRS",month_eventy:"MÅNED",months_eventy:"MÅNEDER",week_eventy:"UGE",weeks_eventy:"UGER",day_eventy:"DAG",days_eventy:"DAGE",hour_eventy:"TIME",hours_eventy:"TIMER",minute_eventy:"MINUT",minutes_eventy:"MINUTTER",second_eventy:"SEKUND",seconds_eventy:"SEKUNDER"}},no:{timer:{complete:"Tid fullført",complete_with_label:"Timer {label} Tid fullført",paused:"Pause",paused_with_time:"Timer {label} pause - {time} tid igjen",paused_without_label:"tid på pause - {time} tid igjen",paused_alexa:"Tid pause på {device} - {time} tid igjen",ready:"Klar",ready_with_time:"Klar - {time}",no_timers:"Ingen tid",no_timers_device:"Ingen tid på {device}",no_timers_google:"Ingen tid på Google Home",remaining:"{time} tid igjen",remaining_with_label:"{time} tid igjen på {label}",remaining_with_device:"{time} tid igjen på {device}",paused_time_left:"Timeout - {time} tid igjen",google_paused:"Google Home er på pause - {time} igjen",timer_ready:"Tid klar"},countdown:{starting:"Starter...",completed:"Ferdig"},time:{hour_compact:"T",day_compact:"D",week_compact:"U",month_compact:"Man",year_compact:"År",minute_compact:"Min",second_compact:"S",hour_full:"Dag",hours_full:"Dager",day_full:"Dag",days_full:"Dager",week_full:"Uke",weeks_full:"Uker",month_full:"Måneder",months_full:"Måneder",year_full:"År",years_full:"År",minute_full:"Minut",minutes_full:"Minutter",second_full:"Sekund",seconds_full:"Sekunder",year_eventy:"ÅR",years_eventy:"ÅRS",month_eventy:"MÅNED",months_eventy:"MÅNEDER",week_eventy:"UKE",weeks_eventy:"UKER",day_eventy:"DAG",days_eventy:"DAGER",hour_eventy:"TIME",hours_eventy:"TIMER",minute_eventy:"MINUTT",minutes_eventy:"MINUTTER",second_eventy:"SEKUND",seconds_eventy:"SEKUNDER"}},es:{timer:{complete:"Temporizador finalizado",complete_with_label:"Temporizador {label} finalizado",paused:"Pausado",paused_with_time:"Temporizador {label} pausado - {time} restante",paused_without_label:"Temporizador pausado - {time} restante",paused_alexa:"Temporizador pausado en {device} - {time} restante",ready:"Listo",ready_with_time:"Listo - {time}",no_timers:"Sin temporizadores",no_timers_device:"Sin temporizadores en {device}",no_timers_google:"Sin temporizadores de Google Home",remaining:"{time} restante",remaining_with_label:"{time} restante en temporizador {label}",remaining_with_device:"{time} restante en {device}",paused_time_left:"Temporizador pausado - {time} restante",google_paused:"Temporizador de Google Home pausado - {time} restante",timer_ready:"Temporizador listo"},countdown:{starting:"Iniciando...",completed:"¡Completado!"},time:{hour_compact:"h",day_compact:"d",week_compact:"sem",month_compact:"mes",year_compact:"a",minute_compact:"min",second_compact:"s",hour_full:"hora",hours_full:"horas",day_full:"día",days_full:"días",week_full:"semana",weeks_full:"semanas",month_full:"mes",months_full:"meses",year_full:"año",years_full:"años",minute_full:"minuto",minutes_full:"minutos",second_full:"segundo",seconds_full:"segundos",year_eventy:"AÑO",years_eventy:"AÑOS",month_eventy:"MES",months_eventy:"MESES",week_eventy:"SEM",weeks_eventy:"SEMS",day_eventy:"DÍA",days_eventy:"DÍAS",hour_eventy:"HORA",hours_eventy:"HORAS",minute_eventy:"MIN",minutes_eventy:"MINS",second_eventy:"SEG",seconds_eventy:"SEGS"}},it:{timer:{complete:"Timer completato",complete_with_label:"Timer {label} completato",paused:"In pausa",paused_with_time:"Timer {label} in pausa - {time} rimanente",paused_without_label:"Timer in pausa - {time} rimanente",paused_alexa:"Timer in pausa su {device} - {time} rimanente",ready:"Pronto",ready_with_time:"Pronto - {time}",no_timers:"Nessun timer",no_timers_device:"Nessun timer su {device}",no_timers_google:"Nessun timer Google Home",remaining:"{time} rimanente",remaining_with_label:"{time} rimanente sul timer {label}",remaining_with_device:"{time} rimanente su {device}",paused_time_left:"Timer in pausa - {time} rimanente",google_paused:"Timer Google Home in pausa - {time} rimanente",timer_ready:"Timer pronto"},countdown:{starting:"Avvio...",completed:"Completato!"},time:{hour_compact:"h",day_compact:"g",week_compact:"set",month_compact:"mo",year_compact:"a",minute_compact:"min",second_compact:"s",hour_full:"ora",hours_full:"ore",day_full:"giorno",days_full:"giorni",week_full:"settimana",weeks_full:"settimane",month_full:"mese",months_full:"mesi",year_full:"anno",years_full:"anni",minute_full:"minuto",minutes_full:"minuti",second_full:"secondo",seconds_full:"secondi",year_eventy:"ANNO",years_eventy:"ANNI",month_eventy:"MESE",months_eventy:"MESI",week_eventy:"SETT",weeks_eventy:"SETT",day_eventy:"GIORNO",days_eventy:"GIORNI",hour_eventy:"ORA",hours_eventy:"ORE",minute_eventy:"MIN",minutes_eventy:"MIN",second_eventy:"SEC",seconds_eventy:"SEC"}},nl:{timer:{complete:"Timer klaar",complete_with_label:"Timer {label} klaar",paused:"Gepauzeerd",paused_with_time:"Timer {label} gepauzeerd - {time} resterend",paused_without_label:"Timer gepauzeerd - {time} resterend",paused_alexa:"Timer gepauzeerd op {device} - {time} resterend",ready:"Klaar",ready_with_time:"Klaar - {time}",no_timers:"Geen timers",no_timers_device:"Geen timers op {device}",no_timers_google:"Geen Google Home timers",remaining:"{time} resterend",remaining_with_label:"{time} resterend op timer {label}",remaining_with_device:"{time} resterend op {device}",paused_time_left:"Timer gepauzeerd - {time} resterend",google_paused:"Google Home timer gepauzeerd - {time} resterend",timer_ready:"Timer klaar"},countdown:{starting:"Starten...",completed:"Voltooid!"},time:{hour_compact:"u",day_compact:"d",week_compact:"w",month_compact:"mnd",year_compact:"j",minute_compact:"min",second_compact:"s",hour_full:"uur",hours_full:"uren",day_full:"dag",days_full:"dagen",week_full:"week",weeks_full:"weken",month_full:"maand",months_full:"maanden",year_full:"jaar",years_full:"jaren",minute_full:"minuut",minutes_full:"minuten",second_full:"seconde",seconds_full:"seconden",year_eventy:"JAAR",years_eventy:"JAREN",month_eventy:"MAAND",months_eventy:"MAANDEN",week_eventy:"WEEK",weeks_eventy:"WEKEN",day_eventy:"DAG",days_eventy:"DAGEN",hour_eventy:"UUR",hours_eventy:"UREN",minute_eventy:"MIN",minutes_eventy:"MIN",second_eventy:"SEC",seconds_eventy:"SEC"}},pt:{timer:{complete:"Temporizador concluído",complete_with_label:"Temporizador {label} concluído",paused:"Pausado",paused_with_time:"Temporizador {label} pausado - {time} restante",paused_without_label:"Temporizador pausado - {time} restante",paused_alexa:"Temporizador pausado em {device} - {time} restante",ready:"Pronto",ready_with_time:"Pronto - {time}",no_timers:"Sem temporizadores",no_timers_device:"Sem temporizadores em {device}",no_timers_google:"Sem temporizadores Google Home",remaining:"{time} restante",remaining_with_label:"{time} restante no temporizador {label}",remaining_with_device:"{time} restante em {device}",paused_time_left:"Temporizador pausado - {time} restante",google_paused:"Temporizador Google Home pausado - {time} restante",timer_ready:"Temporizador pronto"},countdown:{starting:"A iniciar...",completed:"Concluído!"},time:{hour_compact:"h",day_compact:"d",week_compact:"s",month_compact:"mês",year_compact:"a",minute_compact:"m",second_compact:"s",hour_full:"hora",hours_full:"horas",day_full:"dia",days_full:"dias",week_full:"semana",weeks_full:"semanas",month_full:"mês",months_full:"meses",year_full:"ano",years_full:"anos",minute_full:"minuto",minutes_full:"minutos",second_full:"segundo",seconds_full:"segundos",year_eventy:"ANO",years_eventy:"ANOS",month_eventy:"MÊS",months_eventy:"MESES",week_eventy:"SEM",weeks_eventy:"SEMS",day_eventy:"DIA",days_eventy:"DIAS",hour_eventy:"HORA",hours_eventy:"HORAS",minute_eventy:"MIN",minutes_eventy:"MINS",second_eventy:"SEG",seconds_eventy:"SEGS"}}};function Ke(e,t){try{const i=e.split(".");let s=Ye[t];if(!s)return;for(const e of i)if(s=s[e],void 0===s)return;return"string"==typeof s?s:void 0}catch(H){return}}function Je(e){return function(t,i={}){var s,r;let o=Ke(t,null!==(r=null===(s=null==e?void 0:e.locale)||void 0===s?void 0:s.language)&&void 0!==r?r:"en");return o||(o=Ke(t,"en")),o?function(e,t={}){return e?e.replace(/\{([^}]+)\}/g,(e,i)=>{var s;return String(null!==(s=t[i])&&void 0!==s?s:`{${i}}`)}):""}(o,i):t}}const Ze=(e,t,i,s)=>{!function(e,t,i){const s=new CustomEvent(t,{bubbles:!0,cancelable:!0,composed:!0,detail:i});e.dispatchEvent(s)}(e,"hass-action",{config:i,action:s})},Xe=(e,t)=>{const i=(()=>{const e=document.body;if(e.querySelector("action-handler"))return e.querySelector("action-handler");const t=document.createElement("action-handler");return e.appendChild(t),t})();i&&i.bind(e,t)},Qe=pe(class extends _e{update(e,[t]){return Xe(e.element,t),V}render(e){return V}});function et(e){return void 0!==e&&"none"!==e.action}function tt(e){return Qe({hasHold:et(e.hold_action),hasDoubleClick:et(e.double_tap_action)})}function it(e,t){return e=>{Ze(e.target,0,t,e.detail.action)}}class st extends ne{constructor(){super(...arguments),this.errors=[],this.title="Configuration Issues"}static get styles(){return a`
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
    `}render(){if(!this.errors||0===this.errors.length)return G``;const e=this.errors.filter(e=>"critical"===e.severity||"warning"===e.severity);return 0===e.length?G``:G`
      <div class="error-container">
        <ul class="error-list">
          ${e.map(e=>G`
            <li class="error-item">
              <span class="error-field">${e.field}:</span> ${e.message}
            </li>
          `)}
        </ul>
      </div>
    `}}e([ue({type:Array})],st.prototype,"errors",void 0),e([ue({type:String})],st.prototype,"title",void 0);const rt=1e3,ot=6e4;class at{constructor(e,t,i){this._timerId=null,this._intervalMs=rt,this._host=e,this._onWake=t,this._getPlan=i,e.addController(this)}hostDisconnected(){this.stop()}get isRunning(){return null!==this._timerId}get intervalMs(){return this._intervalMs}start(){this._intervalMs=rt,this.schedule()}stop(){null!==this._timerId&&(clearTimeout(this._timerId),this._timerId=null)}noteDisplayChanged(e){this._intervalMs=e?rt:Math.min(2*this._intervalMs,ot)}schedule(){this.stop();const e=this._getPlan();if(e.idle)return;const t=Math.min(this._nextDelay(e),2147483647);this._timerId=setTimeout(()=>{this._timerId=null,this._onWake()},t)}_nextDelay(e){const t=Math.max(1,Math.min(this._intervalMs,e.maxIntervalMs));let i=t-Date.now()%t;return i<50&&(i+=t),null!==e.deadlineMs&&e.deadlineMs>0&&(i=Math.min(i,e.deadlineMs)),Math.max(50,i)}}const nt={minute:6e4,hour:36e5,day:864e5,week:6048e5,month:26298e5},lt=["minute","hour","day","week","month"],ct=["target_date","creation_date","count_up_goal_date","count_up_cycle","timer_entity","title","subtitle","expired_text","header_icon","header_icon_color","header_icon_background","background_color","text_color","progress_color"];class dt extends ne{static async getConfigElement(){return document.createElement("timeflow-card-editor")}static get styles(){return a`
      :host {
        display: block;
        /* Home Assistant's own body font, so the card reads as part of the
           dashboard rather than in a stack of its own. The old hardcoded list
           is kept as the fallback for frontends without the token. */
        font-family: var(--ha-font-family-body, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif);
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
      ha-card:not(:has(.card-content-list)):not(:has(.card-content-compact)):not(:has(.card-content-gridy)):not(:has(.card-content-minimal-square)):not(:has(.card-content-listy)) {
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

      .card-content-list.no-list-icon {
        grid-template-areas: "title countdown";
        grid-template-columns: 1fr auto;
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
        padding: 12px 20px;
        min-height: 50px;
      }

      .card-content-compact.no-compact-icon {
        grid-template-areas: "title progress";
        grid-template-columns: 1fr auto;
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

      /* ═══════════════════════════════════════════════════════════════════════
         GRIDY LAYOUT STYLES - Header row with dot-grid progress
         ═══════════════════════════════════════════════════════════════════════ */

      .card-content-gridy {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 18px 20px;
        min-height: 120px;
        box-sizing: border-box;
        background: inherit;
      }

      .gridy-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .gridy-title-group {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
        flex: 1;
      }

      .gridy-title {
        margin: 0;
        font-size: var(--timeflow-title-size, 1.45rem);
        font-weight: 600;
        line-height: 1.2;
        color: var(--timeflow-card-text-color, inherit);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .gridy-status {
        margin: 0;
        max-width: 45%;
        flex-shrink: 0;
        font-size: var(--timeflow-subtitle-size, 1rem);
        font-weight: 500;
        line-height: 1.2;
        color: var(--timeflow-card-text-color, inherit);
        opacity: 0.8;
        text-align: right;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .gridy-progress {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        width: 100%;
        box-sizing: border-box;
        overflow: hidden;
      }

      .gridy-progress progress-grid {
        opacity: 0.95;
        width: 100%;
      }

      /* ═══════════════════════════════════════════════════════════════════════
         MINIMAL SQUARE LAYOUT STYLES - Single centered unit with circle
         ═══════════════════════════════════════════════════════════════════════ */

      /* The card is content-sized: getGridOptions() asks for rows: 'auto', so the
         ring dictates the card height instead of being squeezed into a slot.
         The host attribute is reflected in updated() so this can be scoped
         without relying on :host(:has()) support. */
      :host([data-card-style="minimal-square"]) ha-card {
        border-radius: var(--timeflow-minimal-radius, 20px);
      }

      .card-content-minimal-square {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        padding: var(--timeflow-minimal-padding, 12px);
        box-sizing: border-box;
        background: inherit;
      }

      .minimal-square-progress {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: 0;
      }

      .minimal-square-shell {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: var(--timeflow-minimal-shell-size, 100px);
        height: var(--timeflow-minimal-shell-size, 100px);
        flex: 0 0 auto;
        margin: 0 auto;
        max-width: 100%;
      }

      .minimal-square-center {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        pointer-events: none;
        padding: var(--timeflow-minimal-center-padding, 8px);
        box-sizing: border-box;
        overflow: hidden;
      }

      .minimal-square-value {
        margin: 0;
        max-width: 100%;
        font-size: var(--timeflow-minimal-value-size, 1.8rem);
        font-weight: 700;
        line-height: 0.95;
        white-space: nowrap;
        color: var(--timeflow-card-text-color, inherit);
      }

      .minimal-square-unit {
        margin: 4px 0 0;
        font-size: var(--timeflow-minimal-unit-size, 0.52rem);
        font-weight: 700;
        line-height: 1;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        opacity: 0.8;
        color: var(--timeflow-card-text-color, inherit);
      }

      @media (max-width: 480px) {
        .card-content-gridy {
          gap: 12px;
        }

        .gridy-header {
          flex-direction: column;
          align-items: flex-start;
        }

        .gridy-status {
          max-width: 100%;
          text-align: left;
        }
      }
      
      @keyframes celebration {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      /* ── Listy: one pill per timer ─────────────────────────────────── */
      .card-content-listy {
        display: flex;
        flex-direction: column;
        padding: 14px 12px 12px 12px;
        box-sizing: border-box;
        width: 100%;
        /* Neutral surfaces are mixed from the text colour rather than hardcoded,
           so the same rules land correctly on a light theme and a dark one. The
           flat fallbacks are for engines without color-mix. */
        --timeflow-listy-row-bg: #f4f5f8;
        --timeflow-listy-row-bg: color-mix(in srgb, currentColor 4%, transparent);
        --timeflow-listy-row-border: rgba(0, 0, 0, 0.04);
        --timeflow-listy-row-border: color-mix(in srgb, currentColor 6%, transparent);
        --timeflow-listy-chip-bg: #ffffff;
        --timeflow-listy-chip-bg: color-mix(in srgb, var(--card-background-color, #fff) 88%, currentColor 4%);
        --timeflow-listy-ring-track: rgba(0, 0, 0, 0.08);
        --timeflow-listy-ring-track: color-mix(in srgb, currentColor 12%, transparent);
        --timeflow-listy-row-text: var(--timeflow-card-text-color, var(--primary-text-color, #141416));
        /* The card's own background, for surfaces that must match whatever card
           they sit on (see the empty row). */
        --timeflow-listy-card-base: var(--timeflow-card-background-color, var(--ha-card-background, var(--card-background-color, #fff)));
      }

      .listy-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 11px;
        padding: 2px 6px;
      }

      .listy-title {
        font-size: 1.05rem;
        font-weight: 700;
        letter-spacing: -0.25px;
        line-height: 1.2;
        color: var(--timeflow-card-text-color, var(--primary-text-color));
        /* A long card title must not push the count off the edge. */
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .listy-count {
        flex-shrink: 0;
        min-width: 22px;
        height: 22px;
        padding: 0 8px;
        border-radius: 9999px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        color: color-mix(in srgb, currentColor 65%, transparent);
        background: color-mix(in srgb, var(--timeflow-listy-card-base), currentColor 6%);
        border: 1px solid var(--timeflow-listy-row-border);
      }

      .listy-rows {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
      }

      .listy-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 9px 18px 9px 11px;
        box-sizing: border-box;
        width: 100%;
        /* The same token ha-card uses, so rows are shaped by the user's theme
           rather than by a number this style invented for itself. */
        border-radius: var(--ha-card-border-radius, var(--ha-border-radius-lg, 12px));
        background: var(--timeflow-listy-row-bg);
        border: 1px solid var(--timeflow-listy-row-border);
      }

      /* The same capsule as a real row, only quieter. Every colour is the card's
         own background tinted by its own text colour, never a theme token: themes
         pair --secondary-background-color and --disabled-color with any card, so
         those landed black on a light translucent card. */
      .listy-row.is-empty {
        background: color-mix(in srgb, var(--timeflow-listy-card-base), currentColor 6%);
      }

      .listy-row.is-empty .listy-row-chip {
        background: color-mix(in srgb, var(--timeflow-listy-card-base), currentColor 12%);
      }

      .listy-row.is-empty .listy-row-subtitle {
        color: color-mix(in srgb, currentColor 65%, transparent);
      }

      .listy-row.is-empty .listy-row-chip ha-icon {
        color: color-mix(in srgb, currentColor 45%, transparent);
      }

      .listy-row.is-empty .listy-ring-track {
        stroke: color-mix(in srgb, currentColor 15%, transparent);
      }

      .listy-row-chip {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        border-radius: 13px;
        flex-shrink: 0;
        background: var(--timeflow-listy-chip-bg);
      }

      .listy-row-chip ha-icon {
        --mdc-icon-size: 24px;
        color: var(--secondary-text-color);
      }

      .listy-row-text {
        display: flex;
        flex-direction: column;
        justify-content: center;
        /* min-width:0 is what lets the ellipsis below actually engage. */
        flex: 1 1 auto;
        min-width: 0;
        margin: 0 14px;
        /* Centred between the chip and the ring. The mock inherits this from
           its host card rather than declaring it, so it has to be explicit
           here. */
        text-align: center;
      }

      .listy-row-title {
        font-size: 1.02rem;
        font-weight: 700;
        letter-spacing: -0.2px;
        line-height: 1.25;
        color: var(--timeflow-listy-row-text);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .listy-row-subtitle {
        margin-top: 2px;
        font-size: 0.83rem;
        font-weight: 400;
        line-height: 1.2;
        color: var(--secondary-text-color, #6b7280);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /* A row's own text colour tints both lines, the subtitle dimmed. Keyed on
         text_color, not background: a background alone leaves the text as it was. */
      .listy-row.has-text-color .listy-row-subtitle {
        color: var(--timeflow-listy-row-text);
        opacity: 0.7;
      }

      .listy-row.paused .listy-row-title,
      .listy-row.paused .listy-row-subtitle,
      .listy-row.paused .listy-row-chip {
        opacity: 0.55;
      }

      .listy-row-ring {
        flex-shrink: 0;
        display: block;
        /* Start the arc at twelve o'clock rather than three. */
        transform: rotate(-90deg);
      }

      .listy-ring-track {
        stroke: var(--timeflow-listy-ring-track);
      }

      .listy-ring-value {
        stroke: var(--timeflow-card-progress-color, var(--primary-color, #94809a));
        transition: stroke-dashoffset 0.3s linear;
      }

      .listy-row.paused .listy-ring-value {
        opacity: 0.45;
      }

      @media (prefers-reduced-motion: reduce) {
        .listy-ring-value {
          transition: none;
        }
      }

      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        ha-card {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
      }
    `}constructor(){super(),this.hass=null,this.config=dt.getStubConfig(),this._resolvedConfig=dt.getStubConfig(),this._progress=0,this._totalDurationMs=0,this._countdown={years:0,months:0,weeks:0,days:0,hours:0,minutes:0,seconds:0,total:0},this._displaySignature="",this._listRows=[],this._listTimers=[],this._listEntryDeadlineMs=null,this._expired=!1,this._validationResult=null,this._initialized=!1,this._localize=null,this._recomputePending=!1,this._watchedEntities=[],this._watchAllEntities=!1,this._scheduler=new at(this,()=>{this._updateCountdownAndRender()},()=>this._buildWakePlan()),this.templateService=new We,this.countdownService=new qe(this.templateService,Ae),this._entryCountdown=new qe(this.templateService,Ae),this.styleManager=new Be,this._pass=null,this._passQueued=!1;const e=dt.getStubConfig();this.config=e,this._resolvedConfig=e}static getStubConfig(){return{type:"custom:timeflow-card",mode:"count_down",target_date:"2026-12-31T23:59:59",creation_date:"2025-12-31T23:59:59",timer_entity:"",title:"New Year Countdown",show_years:!1,show_weeks:!1,show_days:!0,show_hours:!0,show_minutes:!0,show_seconds:!0,progress_color:"",background_color:"",stroke_width:15,icon_size:100,invert_progress:!1,expired_animation:!1,expired_text:""}}setConfig(e){try{const t=Ge.validateConfig(e);if(this._validationResult=t,t.hasCriticalErrors)this.config=t.safeConfig||dt.getStubConfig(),this._resolvedConfig={...this.config};else{if(t.hasWarnings)return this.config={...e},this._resolvedConfig={...e},this._initialized=!0,void this.requestUpdate();this.config={...e},this._resolvedConfig={...e}}this._initialized=!1,this.templateService.clearTemplateCache(),this.styleManager.clearCache(),this._updateCountdownAndRender().then(()=>{this._initialized=!0,this.requestUpdate()})}catch(t){this._validationResult={isValid:!1,errors:[{field:"config",message:t.message||"Unexpected configuration error",severity:"critical",suggestion:"Check console for details and verify your configuration syntax.",value:e}],hasCriticalErrors:!0,hasWarnings:!1,safeConfig:dt.getStubConfig()},this.config=dt.getStubConfig(),this._resolvedConfig={...this.config},this._initialized=!0,this.requestUpdate()}}firstUpdated(){this.templateService.card=this,this._updateCountdownAndRender().then(()=>{this._initialized=!0,this.requestUpdate(),this._startCountdownUpdates()})}connectedCallback(){super.connectedCallback(),this.templateService.connect(),this._initialized&&this._startCountdownUpdates()}disconnectedCallback(){super.disconnectedCallback(),this._stopCountdownUpdates(),this.templateService.disconnect()}updated(e){var t;e.has("config")&&this.setAttribute("data-card-style",(null===(t=this.config)||void 0===t?void 0:t.style)||"classic"),(e.has("hass")||e.has("config"))&&(this.hass&&(this._localize=Je(this.hass)),this._updateCountdownAndRender())}_startCountdownUpdates(){this._scheduler.start()}_stopCountdownUpdates(){this._scheduler.stop()}_buildWakePlan(){var e,t,i;const s=this._resolvedConfig||{},r=s.mode||"count_down",o=!!s.count_up_cycle;if("listy"===s.style){let t=null!==(e=this._listEntryDeadlineMs)&&void 0!==e?e:Number.POSITIVE_INFINITY;for(const e of this._listTimers)e.isActive&&e.remaining>0&&1e3*e.remaining<t&&(t=1e3*e.remaining);const i=Number.isFinite(t);return{idle:!1,maxIntervalMs:ot,deadlineMs:i?t:null}}const a=this._expired&&"count_down"===r&&!o,n=null!==(i=null===(t=this._countdown)||void 0===t?void 0:t.total)&&void 0!==i?i:0;return{idle:a,maxIntervalMs:ot,deadlineMs:"count_up"!==r&&n>0?n:null}}_refreshWatchedEntities(){const e=this.templateService.getEntityDependencies(),t=new Set(e.entities);this.countdownService.getWatchedEntities().forEach(e=>t.add(e)),this._watchedEntities=Array.from(t),this._watchAllEntities=e.watchAll}_hassContextChanged(e,t){var i,s;return e.connected!==t.connected||e.themes!==t.themes||e.locale!==t.locale||e.localize!==t.localize||e.formatEntityState!==t.formatEntityState||(null===(i=e.config)||void 0===i?void 0:i.state)!==(null===(s=t.config)||void 0===s?void 0:s.state)}shouldUpdate(e){var t,i;for(const o of e.keys())if("hass"!==o)return!0;if(!e.has("hass")||!this._initialized)return!0;const s=e.get("hass"),r=this.hass;if(!s||!r)return!0;if(this._hassContextChanged(s,r))return!0;if(this._watchAllEntities)return!0;for(const o of this._watchedEntities)if((null===(t=s.states)||void 0===t?void 0:t[o])!==(null===(i=r.states)||void 0===i?void 0:i[o]))return!0;return!1}requestRecompute(){this._recomputePending||(this._recomputePending=!0,Promise.resolve().then(()=>{var e;this._recomputePending=!1,(null===(e=this._validationResult)||void 0===e?void 0:e.hasCriticalErrors)||this._updateCountdownAndRender()}))}_updateCountdownAndRender(){return this._pass?(this._passQueued=!0,this._pass):(this._pass=(async()=>{try{do{this._passQueued=!1,await this._runPass()}while(this._passQueued)}finally{this._pass=null}})(),this._pass)}async _runPass(){var e;if(null===(e=this._validationResult)||void 0===e?void 0:e.hasCriticalErrors)return;const t={...this.config},i=["target_date","creation_date","count_up_goal_date","count_up_cycle","timer_entity","title","subtitle","text_color","background_color","progress_color","expired_text","header_icon","header_icon_color","header_icon_background","alexa_color","alexa_background","alexa_ring","google_color","google_background","google_ring"],s=[];for(const n of i){const e=t[n];"string"==typeof e&&(this.templateService.isTemplate(e)?s.push(this.templateService.resolveValue(e).then(e=>{t[n]=e||void 0})):"timer_entity"!==n&&(t[n]=this.templateService.resolveStaticValue(e)||void 0))}s.length>0&&await Promise.all(s),this._configValuesDiffer(this._resolvedConfig,t)&&(this._resolvedConfig=t),this.countdownService.beginPass(),await this.countdownService.updateCountdown(t,this.hass),this._countdown={...this.countdownService.getTimeRemaining()},this._expired=this.countdownService.isExpired();const r=await this.countdownService.calculateProgress(t,this.hass);this._progress=Math.round(100*r)/100,this._totalDurationMs=this.countdownService.getTotalDurationMs(),"listy"===t.style?await this._buildListRows(t):this._listRows.length>0&&(this._listRows=[],this._listTimers=[]);const o=this._computeDisplaySignature(),a=o!==this._displaySignature;a&&(this._displaySignature=o),this._refreshWatchedEntities(),this._scheduler.noteDisplayChanged(a),this._scheduler.schedule()}_configValuesDiffer(e,t){const i=new Set([...Object.keys(e||{}),...Object.keys(t||{})]);for(const s of i)if((null==e?void 0:e[s])!==(null==t?void 0:t[s]))return!0;return!1}_computeDisplaySignature(){const e=!1!==this._resolvedConfig.compact_format,t=this.countdownService.getMainDisplay(this._resolvedConfig,this.hass),i=this.countdownService.getSubtitle(this._resolvedConfig,this.hass,this._localize||void 0,e);return"listy"===this._resolvedConfig.style?`listy\0${this._getTitleText()}\0${this._computeListSignature(e)}`:`${this._getTitleText()}\0${t.value}\0${t.label}\0${i}`}_computeListSignature(e){return this._listRows.map(e=>[e.key,e.kind,e.title,e.subtitle,Math.round(e.progress),e.state,e.icon,e.iconColor,e.iconBackground,e.background,e.textColor,e.ringColor].join("")).join("")}async _buildListRows(e){const t=this.countdownService.listAllTimers(e,this.hass);this._listTimers=t;const i=this._buildTimerRows(e,t);i.push(...await this._buildEntryRows(e)),this._listRows=i}_buildTimerRows(e,t){const i=!1!==e.compact_format,s=!1!==e.show_seconds,r=new Set(t.map(e=>e.deviceName).filter(Boolean)),o=r.size>1;return t.map((t,r)=>{var a,n;const l=t.isAlexaTimer?"alexa":t.isGoogleTimer?"google":"timer",c="alexa"===l?"Alexa Timer":"google"===l?"Google Home":t.deviceName||"Timer",d=this._listRowPalette(l,e),u=(t.userDefinedLabel||"").trim(),h=u||(o&&t.deviceName?t.deviceName:c);return{key:null!==(n=null!==(a=t.timerId)&&void 0!==a?a:t.entityId)&&void 0!==n?n:`timer-${r}`,kind:l,title:h,subtitle:u?this._timerRowStatus(t,s,i,o):Me.getTimerSubtitle(t,s,this._localize||void 0,i),progress:Math.min(100,Math.max(0,t.progress)),state:t.finished?"finished":t.isPaused?"paused":"running",icon:d.icon,iconColor:d.iconColor,iconBackground:d.iconBackground,ringColor:d.ringColor}})}async _resolveEntryTemplates(e){const t={...e},i=[];for(const s of ct){const e=t[s];"string"==typeof e&&(this.templateService.isTemplate(e)?i.push(this.templateService.resolveValue(e).then(e=>{t[s]=e||void 0})):"timer_entity"!==s&&(t[s]=this.templateService.resolveStaticValue(e)||void 0))}return i.length>0&&await Promise.all(i),t}_timerRowStatus(e,t,i,s){const r=this._localize,o=Me.formatRemainingTime(e.remaining,t,this._localize||void 0,i);let a;return a=e.finished?r?r("timer.complete"):"Timer complete":e.isPaused?r?r("timer.paused_without_label",{time:o}):`Timer paused - ${o} left`:r?r("timer.remaining",{time:o}):`${o} remaining`,s&&e.deviceName?`${a} · ${e.deviceName}`:a}async _buildEntryRows(e){const t=Array.isArray(e.countdowns)?e.countdowns:[];if(this._listEntryDeadlineMs=null,0===t.length)return[];let i=Number.POSITIVE_INFINITY;const s=!1!==e.compact_format,r=[];for(let a=0;a<t.length;a++){const n=t[a];if(!n||"object"!=typeof n)continue;const l=await this._resolveEntryTemplates(n),c=this._entryCountdown;c.beginPass();let d="",u=0,h=!1,m=0;try{await c.updateCountdown(l,this.hass),h=c.isExpired(),m=c.getTimeRemaining().total,u=await c.calculateProgress(l,this.hass),d=l.subtitle||c.getSubtitle(l,this.hass,this._localize||void 0,s)}catch(o){d=l.subtitle||""}h&&l.expired_text&&(d=l.expired_text),c.getWatchedEntities().forEach(e=>this.countdownService.noteWatchedEntity(e));const p="string"==typeof l.timer_entity?l.timer_entity.trim():"",_=p&&this.hass?Me.getTimerData(p,this.hass):null,g=p?Me.isAlexaTimer(p)?"alexa":Me.isGoogleTimer(p)?"google":"timer":"event",f=this._listRowPalette(g,e,l),y=l.header_icon||f.icon,v=l.header_icon_color||f.iconColor,b=l.header_icon_background||f.iconBackground,w=l.progress_color||f.ringColor,x=_?_.finished?"finished":_.isPaused?"paused":"running":h?"finished":"running";(_?_.isActive&&!_.finished:!h&&"count_up"!==l.mode)&&m>0&&m<i&&(i=m);const $=p&&this.hass?Me.getTimerTitle(p,this.hass):"Countdown";r.push({key:`entry-${a}`,kind:g,title:l.title||$,subtitle:d,progress:Math.min(100,Math.max(0,u)),state:x,icon:y,iconColor:v,iconBackground:b,background:l.background_color,textColor:l.text_color,ringColor:w})}return this._listEntryDeadlineMs=Number.isFinite(i)?i:null,r}_listRowPalette(e,t,i){const s=t.progress_color;return"alexa"===e?{icon:t.alexa_icon||"mdi:amazon-alexa",iconColor:t.alexa_color||"#009bbd",iconBackground:t.alexa_background||"#dff3f7",ringColor:t.alexa_ring||s||"#94809a"}:"google"===e?{icon:t.google_icon||"mdi:google-home",iconColor:t.google_color||"#34a853",iconBackground:t.google_background||"#fef3c7",ringColor:t.google_ring||s||"#b2d4bd"}:"event"===e?{icon:(null==i?void 0:i.header_icon)||t.header_icon||"mdi:calendar-clock",iconColor:(null==i?void 0:i.header_icon_color)||"var(--primary-color, #475569)",iconBackground:(null==i?void 0:i.header_icon_background)||"var(--timeflow-listy-chip-bg)",ringColor:(null==i?void 0:i.progress_color)||s||"var(--primary-color, #94809a)"}:{icon:t.timer_icon||"mdi:timer-outline",iconColor:"var(--secondary-text-color, #475569)",iconBackground:"var(--timeflow-listy-chip-bg)",ringColor:s||"var(--primary-color, #94809a)"}}render(){if(this._validationResult&&!this._validationResult.isValid)return G`
        <error-display
          .errors="${this._validationResult.errors}"
          .title="${this._validationResult.hasCriticalErrors?"Configuration Error":"Configuration Issues"}"
        ></error-display>
      `;const e=this._resolvedConfig.style||"classic";return"eventy"===e?this._renderEventyCard():"classic-compact"===e?this._renderClassicCompactCard():"gridy"===e?this._renderGridyCard():"minimal-square"===e?this._renderMinimalSquareCard():"listy"===e?this._renderListyCard():this._renderCard()}_renderListyCard(){const{progress_color:e,text_color:t,width:i,height:s,aspect_ratio:r}=this._resolvedConfig,{cardBackground:o,textColor:a}=this._getCardColors(),n=[...o?[`background: ${o}`,`--timeflow-card-background-color: ${o}`]:[],...a?[`color: ${a}`,`--timeflow-card-text-color: ${a}`]:[],...e||t?[`--timeflow-card-progress-color: ${e||t}`]:[],...this.styleManager.generateCardDimensionStyles(i,s,r)].join("; "),l=this._getCardClasses(!1),{configWithDefaults:c,shouldEnableActions:d}=this._getActionConfig(),u=this._listRows;return G`
      <ha-card
        class="${l}"
        style="${n}"
        ?actionHandler=${d}
        .actionHandler=${d?tt(c):void 0}
        @action=${d&&this.hass?it(this.hass,c):void 0}
      >
        <div class="card-content-listy">
          <div class="listy-header">
            <span class="listy-title">${this._getTitleText()}</span>
            <span class="listy-count ${0===u.length?"is-empty":""}">${u.length}</span>
          </div>

          ${0===u.length?this._renderListyEmpty():G`
              <div class="listy-rows">
                ${Se(u,e=>e.key,e=>this._renderListyRow(e))}
              </div>
            `}
        </div>
      </ha-card>
    `}_renderListyRow(e){const t=[...e.background?[`background: ${e.background}`]:[],...e.textColor?[`--timeflow-listy-row-text: ${e.textColor}`]:[]].join("; ");return G`
      <div class="listy-row ${e.state} ${e.textColor?"has-text-color":""}" style="${t}">
        <div
          class="listy-row-chip"
          style="${e.iconBackground?`background: ${e.iconBackground}`:""}"
        >
          <ha-icon
            icon="${e.icon}"
            style="${e.iconColor?`color: ${e.iconColor}`:""}"
          ></ha-icon>
        </div>

        <div class="listy-row-text">
          <span class="listy-row-title">${e.title}</span>
          <span class="listy-row-subtitle">${e.subtitle}</span>
        </div>

        ${this._renderListyRing(e)}
      </div>
    `}_renderListyRing(e){const t=100.53,i=t-Math.min(100,Math.max(0,e.progress))/100*t;return G`
      <svg class="listy-row-ring" width="42" height="42" viewBox="0 0 42 42" aria-hidden="true">
        <circle class="listy-ring-track" cx="21" cy="21" r="16" fill="none" stroke-width="4.5"></circle>
        <circle
          class="listy-ring-value"
          cx="21"
          cy="21"
          r="16"
          fill="none"
          stroke-width="4.5"
          stroke-linecap="round"
          stroke-dasharray="${t}"
          stroke-dashoffset="${i}"
          style="${e.ringColor?`stroke: ${e.ringColor}`:""}"
        ></circle>
      </svg>
    `}_renderListyEmpty(){const e=this._localize;return G`
      <div class="listy-row is-empty">
        <div class="listy-row-chip">
          <ha-icon icon="mdi:timer-sand-empty"></ha-icon>
        </div>
        <div class="listy-row-text">
          <span class="listy-row-title">${e?e("timer.no_timers"):"No timers"}</span>
          <span class="listy-row-subtitle">${e?e("timer.list_quiet"):"All quiet across devices"}</span>
        </div>
        <svg class="listy-row-ring" width="42" height="42" viewBox="0 0 42 42" aria-hidden="true">
          <circle
            class="listy-ring-track"
            cx="21"
            cy="21"
            r="16"
            fill="none"
            stroke-width="4.5"
          ></circle>
        </svg>
      </div>
    `}_renderCard(){var e;const{title:t,subtitle:i,text_color:s,background_color:r,progress_color:o,stroke_width:a,icon_size:n,expired_animation:l=!0,expired_text:c="",invert_progress:d=!1,mode:u="count_down",width:h,height:m,aspect_ratio:p,show_months:_,show_days:g,show_hours:f,show_minutes:y,show_seconds:v,compact_format:b}=this._resolvedConfig,w=[this._resolvedConfig.show_years,_,this._resolvedConfig.show_weeks,g,f,y,v].filter(e=>!0===e).length,x=!0===b||!1!==b&&w>=3,{cardBackground:$,textColor:S}=this._getCardColors(),T=o||s||"var(--progress-color, #4caf50)",C=this.styleManager.calculateDynamicIconSize(h,m,p,n),k=this.styleManager.calculateDynamicStrokeWidth(C,a),M=this.styleManager.calculateProportionalSizes(h,m,p),A=this.styleManager.generateCardDimensionStyles(h,m,p),E=[...$?[`background: ${$}`,`--timeflow-card-background-color: ${$}`]:[],...S?[`color: ${S}`,`--timeflow-card-text-color: ${S}`,`--progress-text-color: ${S}`]:[],`--timeflow-card-progress-color: ${T}`,`--timeflow-card-icon-size: ${C}px`,`--timeflow-card-stroke-width: ${k}`,`--timeflow-title-size: ${M.titleSize}rem`,`--timeflow-subtitle-size: ${M.subtitleSize}rem`,...A].join("; "),D=this._resolvedConfig.timer_entity||this._resolvedConfig.auto_discover_alexa||this._resolvedConfig.auto_discover_google?!1!==b:x;let I;if(this._resolvedConfig.timer_entity&&this.hass){const e=Me.getTimerData(this._resolvedConfig.timer_entity,this.hass);I=e?this._expired&&(e.isAlexaTimer||e.isGoogleTimer)?Me.getTimerSubtitle(e,!1!==this._resolvedConfig.show_seconds,this._localize||void 0,D):this._expired?c||this.countdownService.getSubtitle(this._resolvedConfig,this.hass,this._localize||void 0,D):i||Me.getTimerSubtitle(e,!1!==this._resolvedConfig.show_seconds,this._localize||void 0,D):this._expired?c||this.countdownService.getSubtitle(this._resolvedConfig,this.hass,this._localize||void 0,D):i||this.countdownService.getSubtitle(this._resolvedConfig,this.hass,this._localize||void 0,D)}else I=this._resolvedConfig.auto_discover_alexa?i||this.countdownService.getSubtitle(this._resolvedConfig,this.hass,this._localize||void 0,D):this._expired?c||this.countdownService.getSubtitle(this._resolvedConfig,this.hass,this._localize||void 0,D):i||this.countdownService.getSubtitle(this._resolvedConfig,this.hass,this._localize||void 0,D);const N=this._getTitleText(),R=this._getCardClasses(l),{configWithDefaults:z,shouldEnableActions:P}=this._getActionConfig(),H=this._hasHeaderIcon(),O=d?100-this._progress:this._progress,L=`${"count_up"===u?"Elapsed":"Countdown"} progress: ${Math.round(O)}%`;return G`
      <ha-card 
        class="${R}" 
        style="${E}"
        ?actionHandler=${P}
        .actionHandler=${P?tt(z):void 0}
        @action=${P&&this.hass?it(this.hass,z):void 0}
      >
        <div class="card-content">
          <header class="header" style="${H?`--header-icon-container-size: calc(${M.titleSize}rem * 1.3 + ${M.subtitleSize}rem * 1.2 + 2px); --header-icon-size: calc(${M.titleSize}rem * 0.9 + ${M.subtitleSize}rem * 0.7);`:""}">
            ${H?G`
              <div class="header-icon" style="${this._resolvedConfig.header_icon_background?`background: ${this._resolvedConfig.header_icon_background}; border-radius: var(--ha-card-border-radius, 12px);`:""}">
                <ha-icon 
                  icon="${this._resolvedConfig.header_icon}"
                  style="color: ${this._resolvedConfig.header_icon_color||"var(--primary-text-color)"}"
                ></ha-icon>
              </div>
            `:""}
            <div class="title-section">
              <h2 class="title" aria-live="polite">${N}</h2>
              <p class="subtitle" aria-live="polite">${I}</p>
            </div>
          </header>
          
          <div class="content" role="group" aria-label="Countdown Progress">
            <div class="progress-section">
              <progress-circle
                class="progress-circle"
                .progress="${O}"
                .color="${T}"
                .size="${C}"
                .strokeWidth="${k}"
                .bgStroke="${this._resolvedConfig.progress_bg_stroke||"#FFFFFF1A"}"
                .bgOpacity="${null!==(e=this._resolvedConfig.progress_bg_opacity)&&void 0!==e?e:null}"
                aria-label="${L}"
              ></progress-circle>
            </div>
          </div>
        </div>
      </ha-card>
    `}_renderEventyCard(){const{title:e,subtitle:t,text_color:i,background_color:s,expired_animation:r=!0,expired_text:o="",mode:a="count_down",header_icon:n,header_icon_color:l,header_icon_background:c,show_months:d,show_days:u,show_hours:h,show_minutes:m,show_seconds:p,compact_format:_}=this._resolvedConfig,{primaryValue:g,primaryUnit:f}=this._getPrimaryCountdownUnit(),{cardBackground:y,textColor:v}=this._getCardColors(),b=[...y?[`background: ${y}`,`--timeflow-card-background-color: ${y}`]:[],...v?[`color: ${v}`,`--timeflow-card-text-color: ${v}`]:[]].join("; "),w=this._getCardClasses(r);let x;x=t||(this._expired?o||"Completed":this._formatTargetDate());const $=this._getTitleText(),{configWithDefaults:S,shouldEnableActions:T}=this._getActionConfig(),C=this._hasHeaderIcon(n);return G`
      <ha-card 
        class="${w}" 
        style="${b}"
        ?actionHandler=${T}
        .actionHandler=${T?tt(S):void 0}
        @action=${T&&this.hass?it(this.hass,S):void 0}
      >
        <div class="card-content-list ${C?"":"no-list-icon"}">
          ${C?G`
            <div 
              class="list-icon" 
              style="background: ${c||"rgba(var(--rgb-primary-color, 66, 133, 244), 0.15)"};"
            >
              <ha-icon 
                icon="${n}"
                style="color: ${l||"var(--primary-color, var(--primary-text-color))"}"
              ></ha-icon>
            </div>
          `:""}
          
          <!-- Title & Subtitle -->
          <div class="list-title-section">
            <h2 class="list-title">${$}</h2>
            <p class="list-subtitle">${x}</p>
          </div>
          
          <!-- Countdown Display -->
          <div class="list-countdown">
            <span class="list-countdown-value">${g}</span>
            <span class="list-countdown-unit">${f}</span>
          </div>
        </div>
      </ha-card>
    `}_renderClassicCompactCard(){var e;const{title:t,subtitle:i,text_color:s,background_color:r,progress_color:o,stroke_width:a=15,icon_size:n=100,expired_animation:l=!0,expired_text:c="",invert_progress:d=!1,mode:u="count_down",header_icon:h,header_icon_color:m,header_icon_background:p,compact_format:_}=this._resolvedConfig,{cardBackground:g,textColor:f}=this._getCardColors(),y=[...g?[`background: ${g}`,`--timeflow-card-background-color: ${g}`]:[],...f?[`color: ${f}`,`--timeflow-card-text-color: ${f}`]:[]].join("; "),v=this._getCardClasses(l),b=!1!==_;let w;w=i||(this._expired?c||"Completed":this.countdownService.getSubtitle(this._resolvedConfig,this.hass,this._localize||void 0,b));const x=this._getTitleText(),{configWithDefaults:$,shouldEnableActions:S}=this._getActionConfig(),T=this._hasHeaderIcon(h),C=d?100-this._progress:this._progress,k=`${"count_up"===u?"Elapsed":"Countdown"} progress: ${Math.round(C)}%`,M=n||100,A=Math.min(M,50),E=Math.max(4,.4*(a||15)),D=o||"var(--primary-color)";return G`
      <ha-card 
        class="${v}" 
        style="${y}"
        ?actionHandler=${S}
        .actionHandler=${S?tt($):void 0}
        @action=${S&&this.hass?it(this.hass,$):void 0}
      >
        <div class="card-content-compact ${T?"":"no-compact-icon"}">
          ${T?G`
            <div 
              class="compact-icon" 
              style="background: ${p||"rgba(var(--rgb-primary-color, 66, 133, 244), 0.15)"};"
            >
              <ha-icon 
                icon="${h}"
                style="color: ${m||"var(--primary-color, var(--primary-text-color))"}"
              ></ha-icon>
            </div>
          `:""}
          
          <!-- Title & Subtitle -->
          <div class="compact-title-section">
            <h2 class="compact-title">${x}</h2>
            <p class="compact-subtitle">${w}</p>
          </div>
          
          <!-- Progress Circle -->
          <div class="compact-progress">
            <progress-circle
              .progress="${C}"
              .color="${D}"
              .size="${A}"
              .strokeWidth="${E}"
              .bgStroke="${this._resolvedConfig.progress_bg_stroke||"#FFFFFF1A"}"
              .bgOpacity="${null!==(e=this._resolvedConfig.progress_bg_opacity)&&void 0!==e?e:null}"
              aria-label="${k}"
            ></progress-circle>
          </div>
        </div>
      </ha-card>
    `}_pickGridDotUnit(e){for(const t of lt)if(e/nt[t]<=100)return t;return"month"}_resolveGridDotSize(){const e=Number(this._resolvedConfig.grid_dot_size);return!Number.isFinite(e)||e<=0?10:Math.max(4,Math.min(Math.round(e),40))}_resolveGridRows(){const{grid_rows:e}=this._resolvedConfig;if(null==e||""===e||"auto"===e)return 0;const t=Number(e);return!Number.isFinite(t)||t<=0?0:Math.min(Math.floor(t),50)}_resolveGridDotCount(){const{grid_dots:e,grid_dot_unit:t}=this._resolvedConfig,i="number"==typeof e?e:Number(e);if(null!=e&&""!==e&&Number.isFinite(i)&&i>0)return Math.max(1,Math.min(Math.floor(i),200));if("auto"!==e)return 0;const s=this._totalDurationMs;if(!Number.isFinite(s)||s<=0)return 0;const r=t&&"auto"!==t?t:this._pickGridDotUnit(s),o=nt[r]||nt.day;return Math.max(4,Math.min(Math.round(s/o),200))}_renderGridyCard(){var e;const{subtitle:t,text_color:i,background_color:s,progress_color:r,expired_animation:o=!0,expired_text:a="",invert_progress:n=!1,mode:l="count_down",width:c,height:d,aspect_ratio:u,compact_format:h}=this._resolvedConfig,{cardBackground:m,textColor:p}=this._getCardColors(),_=r||i||"var(--progress-color, #4caf50)",g=this.styleManager.generateCardDimensionStyles(c,d,u),f=this.styleManager.calculateProportionalSizes(c,d,u),y=this._resolveGridDotSize(),v=this._resolveGridDotCount(),b=this._resolveGridRows(),w=[...m?[`background: ${m}`,`--timeflow-card-background-color: ${m}`]:[],...p?[`color: ${p}`,`--timeflow-card-text-color: ${p}`]:[],`--timeflow-title-size: ${Math.max(1.25,.95*f.titleSize)}rem`,`--timeflow-subtitle-size: ${Math.max(.95,.95*f.subtitleSize)}rem`,...g].join("; "),x=!1!==h;let $;$=t||(this._expired?a||"Completed":this.countdownService.getSubtitle(this._resolvedConfig,this.hass,this._localize||void 0,x));const S=this._getTitleText(),T=this._getCardClasses(o),{configWithDefaults:C,shouldEnableActions:k}=this._getActionConfig(),M=n?100-this._progress:this._progress,A=`${"count_up"===l?"Elapsed":"Countdown"} progress: ${Math.round(M)}%`;return G`
      <ha-card
        class="${T}"
        style="${w}"
        ?actionHandler=${k}
        .actionHandler=${k?tt(C):void 0}
        @action=${k&&this.hass?it(this.hass,C):void 0}
      >
        <div class="card-content-gridy">
          <div class="gridy-header">
            <div class="gridy-title-group">
              <h2 class="gridy-title" aria-live="polite">${S}</h2>
            </div>
            <p class="gridy-status" aria-live="polite">${$}</p>
          </div>

          <div class="gridy-progress" role="group" aria-label="${"count_up"===l?"Elapsed Progress":"Countdown Progress"}">
            <progress-grid
              .progress="${M}"
              .color="${_}"
              .bgStroke="${this._resolvedConfig.progress_bg_stroke||"#FFFFFF1A"}"
              .bgOpacity="${null!==(e=this._resolvedConfig.progress_bg_opacity)&&void 0!==e?e:null}"
              .fullWidth="${!0}"
              .minColumns="${10}"
              .rows="${5}"
              .columns="${20}"
              .totalDots="${v}"
              .fixedRows="${b}"
              .dotSize="${y}"
              .gap="${6}"
              aria-label="${A}"
            ></progress-grid>
          </div>
        </div>
      </ha-card>
    `}_renderMinimalSquareCard(){var e;const{progress_color:t,progress_bg_stroke:i,stroke_width:s,icon_size:r,expired_animation:o=!0,invert_progress:a=!1,mode:n="count_down",width:l,height:c,aspect_ratio:d}=this._resolvedConfig,{cardBackground:u,textColor:h}=this._getCardColors(),m=h||this._getContrastTextColor(u)||"",p=t||h||"var(--progress-color, #4caf50)",_=Math.max(48,Math.min("number"==typeof r?r:100,400)),g="number"==typeof s?Math.max(1,Math.min(s,Math.floor(_/2))):14,f=Math.max(.9,Math.min(5,.018*_)),y=Math.max(.42,Math.min(1.2,.0052*_)),v=Math.max(6,Math.round(.08*_)),b=a?100-this._progress:this._progress,w=`${"count_up"===n?"Elapsed":"Countdown"} progress: ${Math.round(b)}%`,x=this.countdownService.getPrimaryDisplayUnit(this._resolvedConfig),$=this.countdownService.getMainDisplay(this._resolvedConfig,this.hass),S=/^-?\d+$/.test($.value),T=S?x.value.toString():$.value,C=S?Ue(x.unit,x.value,this._localize||void 0):"",k=[...u?[`background: ${u}`,`--timeflow-card-background-color: ${u}`]:[],...m?[`color: ${m}`,`--timeflow-card-text-color: ${m}`,`--progress-text-color: ${m}`]:[],`--timeflow-card-progress-color: ${p}`,`--timeflow-minimal-value-size: ${f}rem`,`--timeflow-minimal-unit-size: ${y}rem`,`--timeflow-minimal-shell-size: ${_}px`,`--timeflow-minimal-center-padding: ${v}px`,...this.styleManager.generateCardDimensionStyles(l,c,d)].join("; "),M=this._getCardClasses(o),{configWithDefaults:A,shouldEnableActions:E}=this._getActionConfig();return G`
      <ha-card
        class="${M}"
        style="${k}"
        ?actionHandler=${E}
        .actionHandler=${E?tt(A):void 0}
        @action=${E&&this.hass?it(this.hass,A):void 0}
      >
        <div class="card-content-minimal-square">
          <div class="minimal-square-progress">
            <div class="minimal-square-shell" role="group" aria-label="${w}">
              <progress-circle
                class="minimal-square-circle"
                .progress="${b}"
                .color="${p}"
                .size="${_}"
                .strokeWidth="${g}"
                .bgStroke="${i||"rgba(255, 255, 255, 0.08)"}"
                .bgOpacity="${null!==(e=this._resolvedConfig.progress_bg_opacity)&&void 0!==e?e:null}"
                aria-label="${w}"
              ></progress-circle>

              <div class="minimal-square-center" aria-live="polite">
                <p class="minimal-square-value">${T}</p>
                ${C?G`<p class="minimal-square-unit">${C}</p>`:""}
              </div>
            </div>
          </div>
        </div>
      </ha-card>
    `}_getPrimaryCountdownUnit(){const e=this._localize||void 0,t=this.countdownService.getPrimaryDisplayUnit(this._resolvedConfig);return{primaryValue:t.value,primaryUnit:Ue(t.unit,t.value,e)}}_formatTargetDate(){var e,t;const i=this._resolvedConfig.target_date;if(!i)return"";try{const s=new Date(i);if(isNaN(s.getTime()))return"";const r=(null===(t=null===(e=this.hass)||void 0===e?void 0:e.locale)||void 0===t?void 0:t.language)||navigator.language||"en",o={weekday:"short",month:"short",day:"numeric"};return s.toLocaleDateString(r,o)}catch{return""}}_getCardColors(){const{background_color:e,text_color:t}=this._resolvedConfig;return{cardBackground:e||"",textColor:t||""}}_getContrastTextColor(e){if(!e)return"";const t=e.trim(),i=t.match(/^rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);let s,r,o;if(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(t)){const e=4===t.length?`#${t[1]}${t[1]}${t[2]}${t[2]}${t[3]}${t[3]}`:t;s=parseInt(e.slice(1,3),16),r=parseInt(e.slice(3,5),16),o=parseInt(e.slice(5,7),16)}else{if(!i)return"";s=Math.max(0,Math.min(255,Number(i[1]))),r=Math.max(0,Math.min(255,Number(i[2]))),o=Math.max(0,Math.min(255,Number(i[3])))}return(.2126*s+.7152*r+.0722*o)/255<.5?"#f5f1eb":"#171513"}_getCardClasses(e=!0){return[this._initialized?"initialized":"",this._expired&&e?"expired":""].filter(Boolean).join(" ")}_getTitleText(){const{title:e,expired_text:t="",mode:i="count_down"}=this._resolvedConfig;return null==e||"string"==typeof e&&""===e.trim()?this._resolvedConfig.timer_entity&&this.hass?Me.getTimerTitle(this._resolvedConfig.timer_entity,this.hass):this._resolvedConfig.auto_discover_alexa||this._resolvedConfig.auto_discover_google?"Countdown Timer":"count_up"===i?"Elapsed Time":this._expired&&t||"Countdown Timer":e}_getActionConfig(){const e={...this._resolvedConfig};e.timer_entity&&!e.entity&&(e.entity=e.timer_entity),e.entity&&!e.tap_action&&(e.tap_action={action:"more-info"});return{configWithDefaults:e,shouldEnableActions:!!(e.tap_action||e.hold_action||e.double_tap_action)}}_hasHeaderIcon(e){var t;return void 0===e&&(e=null===(t=this._resolvedConfig)||void 0===t?void 0:t.header_icon),"string"==typeof e&&e.trim().length>0}getCardSize(){const{aspect_ratio:e="2/1",height:t,style:i}=this.config;if("eventy"===i)return 1;if("listy"===i)return 1+Math.max(1,this._listRows.length);if(t){const e=parseInt("string"==typeof t?t:t.toString());return e<=100?1:e<=150?2:e<=200?3:4}if(e){const[t,i]=e.split("/").map(Number);if(!t||!i)return 3;const s=i/t;return s>=1.5?4:s>=1?3:2}return 3}getGridOptions(){var e,t,i;const{style:s,grid_options:r}=this.config;if("minimal-square"===s){const s=r||{};return{rows:null!==(e=s.rows)&&void 0!==e?e:"auto",columns:null!==(t=s.columns)&&void 0!==t?t:4,min_rows:s.min_rows,max_rows:s.max_rows,min_columns:null!==(i=s.min_columns)&&void 0!==i?i:2,max_columns:s.max_columns}}}static get version(){return"3.5.1"}}e([ue({type:Object})],dt.prototype,"hass",void 0),e([ue({type:Object})],dt.prototype,"config",void 0),e([he()],dt.prototype,"_resolvedConfig",void 0),e([he()],dt.prototype,"_progress",void 0),e([he()],dt.prototype,"_totalDurationMs",void 0),e([he()],dt.prototype,"_displaySignature",void 0),e([he()],dt.prototype,"_expired",void 0),e([he()],dt.prototype,"_validationResult",void 0),e([he()],dt.prototype,"_initialized",void 0),e([he()],dt.prototype,"_localize",void 0);class ut extends ne{static get styles(){return a`
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
    `}constructor(){super(),this.progress=0,this.color="#4CAF50",this.size=100,this.strokeWidth=15,this.bgStroke="#FFFFFF1A",this.bgOpacity=null,this.progress=0,this.color="#4CAF50",this.size=100,this.strokeWidth=15,this.bgStroke="#FFFFFF1A",this.bgOpacity=null}updated(e){var t;if(e.has("progress")){const e=null===(t=this.renderRoot)||void 0===t?void 0:t.querySelector(".progress-bar");e&&(e.classList.add("updating"),setTimeout(()=>{e&&e.classList.remove("updating")},400))}}updateProgress(e,t=!0){var i;if(t)this.progress=e;else{const t=null===(i=this.renderRoot)||void 0===i?void 0:i.querySelector(".progress-bar");this.progress=e,t&&(t.style.transition="none"),setTimeout(()=>{t&&(t.style.transition="")},20)}}getProgress(){return this.progress}render(){const e=Math.max(0,Math.min(100,Number(this.progress)||0)),t=Number(this.size)||100,i=Number(this.strokeWidth)||15,s=(t-i)/2,r=2*Math.PI*s,o=r-e/100*r,a=null!==this.bgOpacity?`filter: opacity(${this.bgOpacity}%)`:"";return G`
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
            stroke="${this.bgStroke}"
            stroke-width="${i}"
            style="${a}"
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
              stroke-dashoffset: ${o};
              transition: stroke-dashoffset 0.3s ease;
              transform: rotate(-90deg);
              transform-origin: ${t/2}px ${t/2}px;
            "
          ></circle>
        </svg>
      </div>
    `}}e([ue({type:Number})],ut.prototype,"progress",void 0),e([ue({type:String})],ut.prototype,"color",void 0),e([ue({type:Number})],ut.prototype,"size",void 0),e([ue({type:Number})],ut.prototype,"strokeWidth",void 0),e([ue({type:String})],ut.prototype,"bgStroke",void 0),e([ue({type:Number})],ut.prototype,"bgOpacity",void 0);class ht extends ne{constructor(){super(...arguments),this.progress=0,this.color="#4CAF50",this.bgStroke="#FFFFFF1A",this.bgOpacity=null,this.fullWidth=!1,this.minColumns=10,this.rows=5,this.columns=20,this.totalDots=0,this.fixedRows=0,this.dotSize=12,this.gap=8,this._resizeObserver=null,this._containerWidth=0}static get styles(){return a`
      :host {
        display: inline-block;
        vertical-align: middle;
        max-width: 100%;
      }

      .grid {
        display: grid;
        width: max-content;
      }

      .dot {
        display: block;
        border-radius: 999px;
        transition: background-color 0.25s ease, opacity 0.25s ease, transform 0.25s ease;
      }

      .dot.active {
        opacity: 1;
      }
    `}updateProgress(e){this.progress=e}getProgress(){return this.progress}firstUpdated(){"undefined"!=typeof ResizeObserver&&(this._resizeObserver=new ResizeObserver(e=>{var t,i;const s=null!==(i=null===(t=e[0])||void 0===t?void 0:t.contentRect.width)&&void 0!==i?i:0;Math.abs(s-this._containerWidth)>.5&&(this._containerWidth=s,this.requestUpdate())}),this._resizeObserver.observe(this))}disconnectedCallback(){var e;null===(e=this._resizeObserver)||void 0===e||e.disconnect(),this._resizeObserver=null,super.disconnectedCallback()}_getSafeGridValue(e,t){const i=Number(e);return Number.isFinite(i)&&i>0?Math.floor(i):t}_raggedPenalty(e,t){if(t<=0)return 0;const i=t%e;return 0===i?0:(e-i)/e*.35}_resolveResponsiveLayout(e,t,i,s,r=0){if(!this.fullWidth||this._containerWidth<=0)return{columns:e,dotSize:i};const o=this._containerWidth,a=Math.min(t,e),n=i,l=Math.max(4,Math.floor(.6*i));let c=e,d=i,u=Number.POSITIVE_INFINITY;for(let h=a;h<=e;h++){const e=(o-s*(h-1))/h;if(e<l)continue;const t=Math.min(e,n),a=Math.abs(t-i)+this._raggedPenalty(h,r);(a<u-1e-6||Math.abs(a-u)<=1e-6&&h>c)&&(u=a,c=h,d=t)}if(u===Number.POSITIVE_INFINITY){const t=Math.max(1,Math.floor((o+s)/(l+s))),i=Math.max(1,Math.min(e,t)),r=Math.max(2,(o-s*(i-1))/i);return{columns:i,dotSize:Math.min(r,n)}}return{columns:c,dotSize:d}}render(){const e=Math.max(0,Math.min(100,Number(this.progress)||0)),t=this._getSafeGridValue(this.rows,5),i=Number(this.totalDots),s=Number.isFinite(i)&&i>0,r=s?Math.floor(i):0,o=this._getSafeGridValue(this.columns,20);let a=s?Math.min(o,r):o,n=Math.min(this._getSafeGridValue(this.minColumns,10),a);const l=this._getSafeGridValue(this.fixedRows,0);if(s&&l>0){const e=Math.ceil(r/Math.min(l,r));a=Math.max(1,e),n=a}const c=s&&l<=0?r:0,d=this._getSafeGridValue(this.dotSize,12),u=this._getSafeGridValue(this.gap,8);let h=this._resolveResponsiveLayout(a,n,d,u,c),m=u;h.dotSize<d&&(m=Math.max(2,Math.round(u*(h.dotSize/d))),h=this._resolveResponsiveLayout(a,n,d,m,c));const{columns:p}=h;let _=h.dotSize,g=m;if(s&&this.fullWidth&&this._containerWidth>0){const e=(this._containerWidth-m*(p-1))/p,t=p>1?this._containerWidth/(2*p-1):e,i=Math.max(1,Math.ceil(r/p)),s=Math.min(32,Math.max(2.5*d,t),d*(1+6/i));_=Math.max(_,Math.min(e,s)),g=Math.max(m,Math.round(.35*_))}const f=s?r:t*p,y=Math.min(f,Math.max(0,Math.round(e/100*f))),v=null===this.bgOpacity?1:Math.max(0,Math.min(100,Number(this.bgOpacity)||0))/100,b=`repeat(${p}, minmax(0, ${_}px))`,w=this.fullWidth?"100%":"max-content",x=this.fullWidth&&p>1;return G`
      <div
        class="grid"
        style="
          width: ${w};
          grid-template-columns: ${b};
          column-gap: ${x?0:m}px;
          row-gap: ${g}px;
          justify-content: ${x?"space-between":"start"};
          justify-items: center;
        "
      >
        ${Array.from({length:f},(e,t)=>{const i=t<y;return G`
            <span
              class="dot ${i?"active":""}"
              style="
                width: 100%;
                max-width: ${_}px;
                aspect-ratio: 1 / 1;
                background-color: ${i?this.color:this.bgStroke};
                opacity: ${i?1:v};
              "
            ></span>
          `})}
      </div>
    `}}e([ue({type:Number})],ht.prototype,"progress",void 0),e([ue({type:String})],ht.prototype,"color",void 0),e([ue({type:String})],ht.prototype,"bgStroke",void 0),e([ue({type:Number})],ht.prototype,"bgOpacity",void 0),e([ue({type:Boolean})],ht.prototype,"fullWidth",void 0),e([ue({type:Number})],ht.prototype,"minColumns",void 0),e([ue({type:Number})],ht.prototype,"rows",void 0),e([ue({type:Number})],ht.prototype,"columns",void 0),e([ue({type:Number})],ht.prototype,"totalDots",void 0),e([ue({type:Number})],ht.prototype,"fixedRows",void 0),e([ue({type:Number})],ht.prototype,"dotSize",void 0),e([ue({type:Number})],ht.prototype,"gap",void 0);class mt extends ne{constructor(){super(...arguments),this.disabled=!1,this._templateMode=!1,this._codeEditorReady=!!customElements.get("ha-code-editor"),this._touched=!1}connectedCallback(){super.connectedCallback(),this._codeEditorReady||customElements.whenDefined("ha-code-editor").then(()=>{this._codeEditorReady=!0})}willUpdate(e){e.has("data")&&!this._touched&&(this._templateMode=mt.isTemplate(this.data))}static isTemplate(e){return"string"==typeof e&&(e.includes("{{")||e.includes("{%"))}_toggle(){this._touched=!0,this._templateMode=!this._templateMode}_emit(e){this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}_plainChanged(e){var t,i,s;e.stopPropagation();const r=null!==(s=null===(i=null===(t=e.detail)||void 0===t?void 0:t.value)||void 0===i?void 0:i[this.schema.name])&&void 0!==s?s:"";this._emit("datetime"===this.schema.format?function(e){if(!e)return"";const t=e.trim().replace(" ","T");return 16===t.length?`${t}:00`:t}(r):r)}_templateChanged(e){var t,i;e.stopPropagation(),this._emit(null!==(i=null===(t=e.detail)||void 0===t?void 0:t.value)&&void 0!==i?i:"")}render(){var e,t,i;const s=null!==(e=this.schema.plainLabel)&&void 0!==e?e:"Text",r=null!==(t=this.schema.plainIcon)&&void 0!==t?t:"mdi:format-text",o=null!==(i=this.data)&&void 0!==i?i:"";return G`
      <div class="field">
        <div class="header">
          <span class="label">${this.label}</span>
          <ha-button
            appearance="plain"
            size="small"
            ?disabled=${this.disabled}
            @click=${this._toggle}
            title=${this._templateMode?`Switch back to ${s.toLowerCase()}`:"Switch to template/Jinja mode"}
          >
            <ha-icon slot="start" icon=${this._templateMode?r:"mdi:code-braces"}></ha-icon>
            ${this._templateMode?s:"Template"}
          </ha-button>
        </div>

        ${this._templateMode?this._renderTemplate(o):this._renderPlain(o)}
        ${this.helper?G`<div class="helper">${this.helper}</div>`:j}
      </div>
    `}_renderPlain(e){const t="datetime"===this.schema.format?function(e){if(!e||e.includes("{{")||e.includes("{%"))return;const t=new Date(e);if(isNaN(t.getTime()))return;const i=e=>String(e).padStart(2,"0");return`${t.getFullYear()}-${i(t.getMonth()+1)}-${i(t.getDate())} ${i(t.getHours())}:${i(t.getMinutes())}:${i(t.getSeconds())}`}(String(null!=e?e:"")):e;return G`
      <ha-form
        .hass=${this.hass}
        .data=${{[this.schema.name]:t}}
        .schema=${[{name:this.schema.name,selector:this.schema.plainSelector}]}
        .disabled=${this.disabled}
        .computeLabel=${()=>""}
        @value-changed=${this._plainChanged}
      ></ha-form>
    `}_renderTemplate(e){return this._codeEditorReady?G`
      <div class="template-editor">
        <ha-code-editor
          mode="jinja2"
          linewrap
          autocomplete-entities
          .hass=${this.hass}
          .value=${String(e)}
          .hasToolbar=${!1}
          .readOnly=${this.disabled}
          @value-changed=${this._templateChanged}
        ></ha-code-editor>
      </div>
    `:G`
        <textarea
          class="template-input"
          rows="2"
          spellcheck="false"
          .value=${String(e)}
          placeholder=${"{{ states('sensor.example') }}"}
          ?disabled=${this.disabled}
          @input=${e=>this._emit(e.target.value)}
        ></textarea>
      `}static get styles(){return a`
      :host {
        display: block;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .label {
        font-weight: 500;
        font-size: 14px;
        color: var(--primary-text-color);
      }
      .helper {
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      ha-form {
        display: block;
      }
      .template-editor {
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        padding: 4px 8px;
        overflow: auto;
      }
      .template-editor:focus-within {
        border-color: var(--primary-color);
      }
      .template-editor ha-code-editor {
        --code-mirror-max-height: 120px;
      }
      .template-input {
        width: 100%;
        box-sizing: border-box;
        min-height: 48px;
        padding: 12px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-family: var(--ha-font-family-code, monospace);
        font-size: 13px;
        line-height: 1.4;
        resize: vertical;
      }
      .template-input:focus {
        outline: none;
        border-color: var(--primary-color);
      }
    `}}e([ue({attribute:!1})],mt.prototype,"hass",void 0),e([ue({attribute:!1})],mt.prototype,"schema",void 0),e([ue({attribute:!1})],mt.prototype,"data",void 0),e([ue()],mt.prototype,"label",void 0),e([ue()],mt.prototype,"helper",void 0),e([ue({type:Boolean})],mt.prototype,"disabled",void 0),e([he()],mt.prototype,"_templateMode",void 0),e([he()],mt.prototype,"_codeEditorReady",void 0),customElements.get("ha-form-tf_template")||customElements.define("ha-form-tf_template",mt);class pt extends ne{constructor(){super(...arguments),this.disabled=!1}render(){var e,t,i;return G`
      <div class="group">
        ${(null===(e=this.schema)||void 0===e?void 0:e.title)?G`<span class="title">${this.schema.title}</span>`:j}
        <ha-form
          .hass=${this.hass}
          .data=${this.data}
          .schema=${null!==(i=null===(t=this.schema)||void 0===t?void 0:t.schema)&&void 0!==i?i:[]}
          .disabled=${this.disabled}
          .computeLabel=${this.computeLabel}
          .computeHelper=${this.computeHelper}
          .localizeValue=${this.localizeValue}
        ></ha-form>
      </div>
    `}static get styles(){return a`
      :host {
        display: block;
      }
      /* Mixed from the text colour so it lands correctly on a light theme and
         a dark one alike; the flat value is the fallback for engines without
         color-mix. */
      .group {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 12px;
        border-radius: 12px;
        background: rgba(127, 127, 127, 0.08);
        background: color-mix(in srgb, currentColor 5%, transparent);
      }
      .title {
        font-weight: 600;
        font-size: 14px;
        color: var(--primary-text-color);
      }
      ha-form {
        display: block;
      }
    `}}e([ue({attribute:!1})],pt.prototype,"hass",void 0),e([ue({attribute:!1})],pt.prototype,"schema",void 0),e([ue({attribute:!1})],pt.prototype,"data",void 0),e([ue({type:Boolean})],pt.prototype,"disabled",void 0),e([ue({attribute:!1})],pt.prototype,"computeLabel",void 0),e([ue({attribute:!1})],pt.prototype,"computeHelper",void 0),e([ue({attribute:!1})],pt.prototype,"localizeValue",void 0),customElements.get("ha-form-tf_group")||customElements.define("ha-form-tf_group",pt);const _t=pe(class extends _e{constructor(){super(...arguments),this.key=j}render(e,t){return this.key=e,t}update(e,[t,i]){return t!==this.key&&(we(e),this.key=t),i}}),gt=()=>"";class ft extends ne{constructor(){super(...arguments),this.disabled=!1,this._expanded={},this._loaded={},this._pendingSource={},this._yamlMode={},this._yamlReady=!!customElements.get("ha-yaml-editor"),this._sortableReady=!!customElements.get("ha-sortable"),this._titles=new Map,this._structure=0}connectedCallback(){super.connectedCallback(),this._yamlReady||customElements.whenDefined("ha-yaml-editor").then(()=>{this._yamlReady=!0}),this._sortableReady||customElements.whenDefined("ha-sortable").then(()=>{this._sortableReady=!0})}disconnectedCallback(){super.disconnectedCallback();for(const e of this._titles.values())e.unsub.then(e=>e()).catch(()=>{});this._titles.clear()}willUpdate(e){var t;if(!e.has("data")&&!e.has("hass"))return;const i=new Set(this._entries.map(e=>{var t,i;return null!==(i=null===(t=e.title)||void 0===t?void 0:t.trim())&&void 0!==i?i:""}).filter(e=>mt.isTemplate(e)));for(const[r,o]of this._titles)i.has(r)||(o.unsub.then(e=>e()).catch(()=>{}),this._titles.delete(r));const s=null===(t=this.hass)||void 0===t?void 0:t.connection;if(s)for(const r of i){if(this._titles.has(r))continue;const e={unsub:Ve(s,t=>{e.text=null==(null==t?void 0:t.result)?"":String(t.result).trim(),this.requestUpdate()},{template:r,strict:!1})};e.unsub.catch(()=>{e.text="",this.requestUpdate()}),this._titles.set(r,e)}}_displayTitle(e){var t;const i=null==e?void 0:e.trim();if(!i)return"Untitled";if(!mt.isTemplate(i))return i;const s=null===(t=this._titles.get(i))||void 0===t?void 0:t.text;return void 0===s?"…":s||"Untitled"}get _entries(){return Array.isArray(this.data)?this.data:[]}_emit(e){this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e.length>0?e:void 0},bubbles:!0,composed:!0}))}_add(){const e=[...this._entries,{title:"Countdown",target_date:""}];this._expanded={...this._expanded,[e.length-1]:!0},this._loaded={...this._loaded,[e.length-1]:!0},this._emit(e)}_remove(e){const t=this._entries.filter((t,i)=>i!==e);this._reindex(e,null),this._emit(t)}_itemMoved(e){e.stopPropagation();const{oldIndex:t,newIndex:i}=e.detail;if(t===i)return;const s=[...this._entries],[r]=s.splice(t,1);s.splice(i,0,r);const o=e=>{const s={};for(const[r,o]of Object.entries(e)){const e=Number(r);e!==t?t<i&&e>t&&e<=i?s[e-1]=o:t>i&&e>=i&&e<t?s[e+1]=o:s[e]=o:s[i]=o}return s};this._expanded=o(this._expanded),this._loaded=o(this._loaded),this._pendingSource=o(this._pendingSource),this._yamlMode=o(this._yamlMode),this._structure++,this._emit(s)}_move(e,t){const i=e+t;if(i<0||i>=this._entries.length)return;const s=[...this._entries];[s[e],s[i]]=[s[i],s[e]],this._reindex(e,i),this._emit(s)}_reindex(e,t){const i=i=>{const s={};for(const[r,o]of Object.entries(i)){const i=Number(r);if(null===t){if(i===e)continue;s[i>e?i-1:i]=o}else s[i===e?t:i===t?e:i]=o}return s};this._expanded=i(this._expanded),this._loaded=i(this._loaded),this._pendingSource=i(this._pendingSource),this._yamlMode=i(this._yamlMode),this._structure++}_sourceOf(e){var t;const i=this._entries[e];return(null==i?void 0:i.timer_entity)?"timer":null!==(t=this._pendingSource[e])&&void 0!==t?t:"date"}_setSource(e,t){if(t===this._sourceOf(e))return;const i=[...this._entries],s={...i[e]};"date"===t&&delete s.timer_entity,i[e]=s,this._pendingSource={...this._pendingSource,[e]:t},this._emit(i)}_entryYamlChanged(e,t){t.stopPropagation();const i=t.detail;if(!1===(null==i?void 0:i.isValid))return;const s=null==i?void 0:i.value;if(!s||"object"!=typeof s||Array.isArray(s))return;const r=[...this._entries];r[e]=s,this._emit(r)}_toggleYaml(e){this._yamlMode={...this._yamlMode,[e]:!this._yamlMode[e]},this._expanded={...this._expanded,[e]:!0},this._loaded={...this._loaded,[e]:!0}}_entryChanged(e,t){var i,s;t.stopPropagation();const r=[...this._entries];r[e]={...r[e],...null!==(s=null===(i=t.detail)||void 0===i?void 0:i.value)&&void 0!==s?s:{}},this._emit(r)}_toggle(e,t){this._expanded={...this._expanded,[e]:t},t&&!this._loaded[e]&&(this._loaded={...this._loaded,[e]:!0})}_entrySchema(e,t){const i="count_up"===e.mode,s=e=>({type:"tf_template",name:e,plainSelector:{datetime:{}},plainLabel:"Picker",plainIcon:"mdi:calendar",format:"datetime"});return[{type:"tf_template",name:"title",plainSelector:{text:{}}},..."timer"===t?[{type:"tf_template",name:"timer_entity",plainSelector:{entity:{domain:["timer","sensor","input_datetime"]}},plainLabel:"Entity",plainIcon:"mdi:shape-outline"}]:[s("target_date"),{name:"mode",selector:{select:{options:[{value:"count_down",label:"Count Down"},{value:"count_up",label:"Count Up"}],mode:"dropdown"}}},s(i?"count_up_goal_date":"creation_date")],{type:"tf_template",name:"subtitle",plainSelector:{text:{}}},{type:"tf_group",name:"group_entry_appearance",flatten:!0,title:"Appearance",schema:[{type:"tf_template",name:"header_icon",plainSelector:{icon:{}},plainLabel:"Icon",plainIcon:"mdi:emoticon-outline"},{type:"tf_template",name:"header_icon_color",plainSelector:{text:{}}},{type:"tf_template",name:"header_icon_background",plainSelector:{text:{}}},{type:"tf_template",name:"background_color",plainSelector:{text:{}}},{type:"tf_template",name:"text_color",plainSelector:{text:{}}},{type:"tf_template",name:"progress_color",plainSelector:{text:{}}}]}]}render(){const e=this._entries;return G`
      <div class="list">
        ${this._sortableReady?G`
            <ha-sortable
              handle-selector=".drag-handle"
              draggable-selector=".entry"
              .disabled=${this.disabled}
              @item-moved=${this._itemMoved}
            >
              <div class="entries">
                ${e.map((t,i)=>this._renderEntry(t,i,e.length))}
              </div>
            </ha-sortable>
          `:e.map((t,i)=>this._renderEntry(t,i,e.length))}


        <ha-button appearance="filled" ?disabled=${this.disabled} @click=${this._add}>
          <ha-icon slot="start" icon="mdi:plus"></ha-icon>
          Add countdown
        </ha-button>
      </div>
    `}_renderEntry(e,t,i){const s=this._displayTitle(e.title);return G`
      <ha-expansion-panel
        class="entry"
        outlined
        .expanded=${!!this._expanded[t]}
        @expanded-changed=${e=>this._toggle(t,e.target.expanded)}
      >
        <div slot="header" class="entry-header">
          ${this._sortableReady?G`
              <ha-svg-icon
                class="drag-handle"
                .path=${"M21,11H3V9H21V11M21,13H3V15H21V13Z"}
                @click=${e=>e.stopPropagation()}
              ></ha-svg-icon>
            `:j}
          ${this._yamlReady?G`
              <ha-icon-button
                .path=${this._yamlMode[t]?"M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z":"M8,3A2,2 0 0,0 6,5V9A2,2 0 0,1 4,11H3V13H4A2,2 0 0,1 6,15V19A2,2 0 0,0 8,21H10V19H8V14A2,2 0 0,0 6,12A2,2 0 0,0 8,10V5H10V3M16,3A2,2 0 0,1 18,5V9A2,2 0 0,0 20,11H21V13H20A2,2 0 0,0 18,15V19A2,2 0 0,1 16,21H14V19H16V14A2,2 0 0,1 18,12A2,2 0 0,1 16,10V5H14V3H16Z"}
                .label=${this._yamlMode[t]?"Show visual editor":"Edit in YAML"}
                @click=${e=>{e.stopPropagation(),this._toggleYaml(t)}}
              ></ha-icon-button>
            `:j}
          <span class="entry-title">${s}</span>
          <span class="entry-actions">
            ${this._sortableReady?j:G`
                <ha-icon-button
                  .path=${"M7,15L12,10L17,15H7Z"}
                  label="Move up"
                  ?disabled=${0===t||this.disabled}
                  @click=${e=>{e.stopPropagation(),this._move(t,-1)}}
                ></ha-icon-button>
                <ha-icon-button
                  .path=${"M7,10L12,15L17,10H7Z"}
                  label="Move down"
                  ?disabled=${t===i-1||this.disabled}
                  @click=${e=>{e.stopPropagation(),this._move(t,1)}}
                ></ha-icon-button>
              `}
            <ha-icon-button
              .path=${"M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"}
              label="Remove"
              ?disabled=${this.disabled}
              @click=${e=>{e.stopPropagation(),this._remove(t)}}
            ></ha-icon-button>
          </span>
        </div>

        <div class="entry-body">
          ${this._loaded[t]&&this._yamlMode[t]?_t(this._structure,G`
              <ha-yaml-editor
                .defaultValue=${e}
                .readOnly=${this.disabled}
                @value-changed=${e=>this._entryYamlChanged(t,e)}
              ></ha-yaml-editor>
            `):j}

          ${this._loaded[t]&&!this._yamlMode[t]?G`
              <div class="entry-source">
                <span class="entry-source-label">Source</span>
                <ha-control-select
                  .options=${[{value:"date",label:"Date",ariaLabel:"Count to a date you choose"},{value:"timer",label:"Entity",ariaLabel:"Follow a timer entity"}]}
                  .value=${this._sourceOf(t)}
                  @value-changed=${e=>{var i;e.stopPropagation(),this._setSource(t,null===(i=e.detail)||void 0===i?void 0:i.value)}}
                ></ha-control-select>
              </div>
              <ha-form
                .hass=${this.hass}
                .data=${e}
                .schema=${this._entrySchema(e,this._sourceOf(t))}
                .disabled=${this.disabled}
                .computeLabel=${this.computeLabel}
                .computeHelper=${gt}
                @value-changed=${e=>this._entryChanged(t,e)}
              ></ha-form>
            `:j}

        </div>
      </ha-expansion-panel>
    `}static get styles(){return a`
      :host {
        display: block;
      }
      .list {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
      /* The rows still span the panel; only the Add button sizes to its own
         label, the way ha-selector-object's does. */
      .list > ha-sortable,
      .list > ha-expansion-panel {
        align-self: stretch;
      }
      /* Not the theme's card radius: these are rows inside a section, and at a
         theme radius of 24px they read as cards of their own. */
      ha-expansion-panel {
        --expansion-panel-content-padding: 0;
        border-radius: 6px;
      }
      .entry-header {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        min-width: 0;
      }
      .entry-title {
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        /* Takes the slack, so the actions sit against the chevron rather than
           floating in the middle of the row. */
        flex: 1 1 auto;
        min-width: 0;
      }
      .entry-actions {
        display: flex;
        flex-shrink: 0;
        --mdc-icon-button-size: 32px;
        --mdc-icon-size: 18px;
        color: var(--secondary-text-color);
      }
      .entries {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      /* Unknown elements are inline; this keeps the layout intact even on a
         frontend where ha-sortable never registers. */
      ha-sortable {
        display: block;
      }
      /* Matches ha-selector-object: padded for a comfortable grab target, then
         pulled back so the row still starts on the panel's own edge. */
      .drag-handle {
        cursor: move;
        padding: 8px;
        margin-inline-start: -8px;
        flex-shrink: 0;
        color: var(--secondary-text-color);
      }
      .entry-body {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 12px;
      }
      .entry-source {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .entry-source-label {
        font-weight: 600;
        font-size: 14px;
        color: var(--primary-text-color);
      }
      .entry-source ha-control-select {
        --control-select-thickness: 40px;
        --control-select-border-radius: 10px;
      }
    `}}e([ue({attribute:!1})],ft.prototype,"hass",void 0),e([ue({attribute:!1})],ft.prototype,"schema",void 0),e([ue({attribute:!1})],ft.prototype,"data",void 0),e([ue({type:Boolean})],ft.prototype,"disabled",void 0),e([ue({attribute:!1})],ft.prototype,"computeLabel",void 0),e([ue({attribute:!1})],ft.prototype,"computeHelper",void 0),e([he()],ft.prototype,"_expanded",void 0),e([he()],ft.prototype,"_loaded",void 0),e([he()],ft.prototype,"_pendingSource",void 0),e([he()],ft.prototype,"_yamlMode",void 0),e([he()],ft.prototype,"_yamlReady",void 0),e([he()],ft.prototype,"_sortableReady",void 0),customElements.get("ha-form-tf_countdowns")||customElements.define("ha-form-tf_countdowns",ft);const yt={classic:{title:!0,subtitle:!0,expiredText:!0,compactFormat:!0,timeUnits:!0,showSeconds:!0,headerIcon:!0,progressColor:!0,ringGeometry:!0,invertProgress:!0,progressTrack:!0,expiredAnimation:!0,dotGrid:!1,timerList:!1,width:!0,height:!0,aspectRatio:!0},eventy:{title:!0,subtitle:!0,expiredText:!0,compactFormat:!0,timeUnits:!0,showSeconds:!0,headerIcon:!0,progressColor:!1,ringGeometry:!1,invertProgress:!1,progressTrack:!1,expiredAnimation:!0,dotGrid:!1,timerList:!1,width:!1,height:!1,aspectRatio:!1},"classic-compact":{title:!0,subtitle:!0,expiredText:!0,compactFormat:!0,timeUnits:!0,showSeconds:!0,headerIcon:!0,progressColor:!0,ringGeometry:!0,invertProgress:!0,progressTrack:!0,expiredAnimation:!0,dotGrid:!1,timerList:!1,width:!1,height:!1,aspectRatio:!1},gridy:{title:!0,subtitle:!0,expiredText:!0,compactFormat:!0,timeUnits:!0,showSeconds:!0,headerIcon:!1,progressColor:!0,ringGeometry:!1,invertProgress:!0,progressTrack:!0,expiredAnimation:!0,dotGrid:!0,timerList:!1,width:!0,height:!0,aspectRatio:!0},"minimal-square":{title:!1,subtitle:!1,expiredText:!1,compactFormat:!1,timeUnits:!1,showSeconds:!1,headerIcon:!1,progressColor:!0,ringGeometry:!0,invertProgress:!0,progressTrack:!0,expiredAnimation:!0,dotGrid:!1,timerList:!1,width:!0,height:!0,aspectRatio:!0},listy:{title:!0,subtitle:!1,expiredText:!1,compactFormat:!0,timeUnits:!1,showSeconds:!0,headerIcon:!0,progressColor:!0,ringGeometry:!1,invertProgress:!1,progressTrack:!1,expiredAnimation:!1,dotGrid:!1,timerList:!0,width:!0,height:!0,aspectRatio:!0}};function vt(e){const t=null==e?void 0:e.style;return t&&t in yt?t:"classic"}function bt(e){return yt[vt(e)]}function wt(e){return e?e.timer_entity?"timer":e.auto_discover_alexa||e.auto_discover_google||"listy"===vt(e)?"auto":"date":"date"}function xt(e){return"date"===e}const $t={date:[],timer:["timer_entity"],auto:["auto_discover_alexa","auto_discover_google"]};function St(e,t){const i=wt(e);return t&&"date"===i?t:i}function Tt(e,t,i){return{type:"tf_group",name:`group_${e}`,flatten:!0,title:t,schema:i}}function Ct(e,t,i){return{type:"tf_template",name:e,plainSelector:t,...i?{plainLabel:i.label,plainIcon:i.icon}:{}}}const kt=[{value:"classic",label:"Classic",icon:"mdi:circle-slice-3",description:"Progress ring with the countdown inside"},{value:"classic-compact",label:"Classic Compact",icon:"mdi:card-account-details-outline",description:"A row, with a small ring"},{value:"eventy",label:"Eventy",icon:"mdi:numeric",description:"A row, with one big number"},{value:"gridy",label:"Gridy",icon:"mdi:dots-grid",description:"A row, with a dot grid for progress"},{value:"minimal-square",label:"Minimal Square",icon:"mdi:square-rounded-outline",description:"One number in a thick ring"},{value:"listy",label:"Listy",icon:"mdi:format-list-bulleted",description:"One row per running timer"}],Mt=[{value:"auto",label:"Auto"},{value:"minute",label:"Minute"},{value:"hour",label:"Hour"},{value:"day",label:"Day"},{value:"week",label:"Week"},{value:"month",label:"Month"}],At=[{value:"auto",label:"Auto (fit the width)"},...[1,2,3,4,5,6].map(e=>({value:String(e),label:String(e)}))];function Et(e,t){return"listy"===t?[]:"timer"===e?[Ct("timer_entity",{entity:{domain:["timer","sensor","input_datetime"]}},{label:"Entity",icon:"mdi:shape-outline"})]:"auto"===e?[{type:"grid",schema:[{name:"auto_discover_alexa",selector:{boolean:{}}},{name:"auto_discover_google",selector:{boolean:{}}}]}]:[{name:"mode",selector:{select:{options:[{value:"count_down",label:"Count Down"},{value:"count_up",label:"Count Up"}],mode:"dropdown"}}}]}function Dt(e,t){return xt(t)&&"count_up"===e.mode?[Ct("count_up_cycle",{text:{}})]:[]}function It(e){return e.headerIcon?[{type:"expandable",name:"section_header_icon",flatten:!0,title:"Icon",icon:"mdi:image-filter-vintage",schema:[Ct("header_icon",{icon:{}},{label:"Icon",icon:"mdi:emoticon-outline"}),Ct("header_icon_color",{text:{}}),Ct("header_icon_background",{text:{}})]}]:[]}function Nt(e){const t=[];return e.progressColor&&t.push(Ct("progress_color",{text:{}})),t.push(Ct("background_color",{text:{}}),Ct("text_color",{text:{}})),[{type:"expandable",name:"section_appearance",flatten:!0,title:"Appearance",icon:"mdi:palette",schema:t}]}function Rt(e){const t=[];e.width&&t.push({name:"width",selector:{text:{placeholder:"300px, 100%, 20em"}}}),e.height&&t.push({name:"height",selector:{text:{placeholder:"200px, auto"}}});const i=[];return 2===t.length?i.push({type:"grid",schema:t}):i.push(...t),e.aspectRatio&&i.push({name:"aspect_ratio",selector:{text:{placeholder:"16/9, 4/3, 1/1"}}}),0===i.length?[]:[{type:"expandable",name:"section_layout",flatten:!0,title:"Layout",icon:"mdi:page-layout-body",schema:i}]}function zt(e){const t=[];return e.ringGeometry&&t.push(Tt("ring","Ring",[{name:"stroke_width",selector:{number:{min:1,max:50,step:1,unit_of_measurement:"px"}}},{name:"icon_size",selector:{number:{min:10,max:350,step:5,unit_of_measurement:"px"}}}])),e.progressTrack&&t.push(Tt("track","Track",[{name:"progress_bg_stroke",selector:{text:{placeholder:"#515751, rgba(81, 87, 81, 0.2)"}}},{name:"progress_bg_opacity",selector:{number:{min:0,max:100,step:5,unit_of_measurement:"%"}}}])),e.invertProgress&&t.push({name:"invert_progress",selector:{boolean:{}}}),0===t.length?[]:[{type:"expandable",name:"section_progress",flatten:!0,title:"Progress Circle",icon:"mdi:circle-slice-3",schema:t}]}function Pt(e){return e.dotGrid?[{type:"expandable",name:"section_dot_grid",flatten:!0,title:"Dot Grid",icon:"mdi:dots-grid",schema:[{name:"grid_dots",selector:{select:{custom_value:!0,options:[{value:"auto",label:"Auto (match the timeframe)"}],mode:"dropdown"}}},{name:"grid_dot_unit",selector:{select:{options:Mt,mode:"dropdown"}}},{name:"grid_rows",selector:{select:{custom_value:!0,options:At,mode:"dropdown"}}},Tt("dot_size","Size",[{name:"grid_dot_size",selector:{number:{min:4,max:40,step:1,unit_of_measurement:"px"}}}])]}]:[]}function Ht(e){return bt(e).timerList?[{type:"grid",schema:[{name:"auto_discover_alexa",selector:{boolean:{}}},{name:"auto_discover_google",selector:{boolean:{}}}]},{name:"max_timers",selector:{number:{min:1,max:20,step:1,mode:"box"}}},{type:"expandable",name:"section_alexa_rows",flatten:!0,title:"Alexa Timer Styling",icon:"mdi:amazon-alexa",schema:[{name:"alexa_icon",selector:{icon:{}}},Ct("alexa_color",{text:{placeholder:"#009bbd"}}),Ct("alexa_background",{text:{placeholder:"#dff3f7"}}),Ct("alexa_ring",{text:{placeholder:"#94809a"}})]},{type:"expandable",name:"section_google_rows",flatten:!0,title:"Google Home Timer Styling",icon:"mdi:google-home",schema:[{name:"google_icon",selector:{icon:{}}},Ct("google_color",{text:{placeholder:"#34a853"}}),Ct("google_background",{text:{placeholder:"#fef3c7"}}),Ct("google_ring",{text:{placeholder:"#b2d4bd"}})]},{type:"grid",schema:[{name:"show_seconds",selector:{boolean:{}}},{name:"compact_format",selector:{boolean:{}}}]}]:[]}function Ot(e,t){return function(e,t){return e.subtitle&&xt(t)?[{type:"grid",schema:[{name:"subtitle_prefix",selector:{text:{}}},{name:"subtitle_suffix",selector:{text:{}}}]}]:[]}(bt(e),null!=t?t:wt(e))}const Lt={timer_entity:"Timer Entity",mode:"Mode",target_date:"Target Date/Time",creation_date:"Start Date",count_up_goal_date:"Goal Date",count_up_cycle:"Count-up Cycle",auto_discover_alexa:"Alexa Timers",auto_discover_google:"Google Home Timers",max_timers:"Maximum Timers Shown",alexa_icon:"Icon",alexa_color:"Icon Colour",alexa_background:"Chip Background",alexa_ring:"Ring Colour",google_icon:"Icon",google_color:"Icon Colour",google_background:"Chip Background",google_ring:"Ring Colour",show_days:"Days",show_hours:"Hours",show_minutes:"Minutes",show_seconds:"Seconds",show_months:"Months",show_years:"Years",show_weeks:"Weeks",compact_format:"Compact Format",subtitle_prefix:"Subtitle Prefix",subtitle_suffix:"Subtitle Suffix",expired_animation:"Expired Animation",expired_text:"Expired Text",progress_color:"Progress Color",background_color:"Background Color",text_color:"Text Color",stroke_width:"Thickness",icon_size:"Size",grid_dots:"Dots",grid_dot_unit:"Dot Unit",grid_rows:"Rows",grid_dot_size:"Diameter",progress_bg_stroke:"Colour",progress_bg_opacity:"Opacity",invert_progress:"Invert Progress",aspect_ratio:"Aspect Ratio",header_icon:"Icon",header_icon_color:"Icon Color",header_icon_background:"Icon Background",style:"Card Style"},Ft={section_alexa_rows:"Leave a field empty to keep the Alexa default.",section_google_rows:"Leave a field empty to keep the Google Home default.",section_header_icon:"Shown beside the card title.",section_appearance:"Colours accept #4caf50, rgb(), a CSS name, var(--…), or an entity id.",section_layout:"Leave a field empty to let the card size itself.",section_progress:"The ring drawn around the countdown.",section_dot_grid:"Leave Dots empty for the fixed 5 × 20 grid. Auto picks a unit and row count that keep it readable, and dots grow past Size to fill the width.",countdowns:"Shown alongside the discovered timers, in the order listed.",section_actions:"What happens when the card is tapped, held, or double-tapped.",timer_entity:"Select a timer, sensor, or input_datetime entity",target_date:'ISO date, entity, or template: "2024-12-31T23:59:59", "{{ states(\'input_datetime.deadline\') }}"',creation_date:"Where the progress ring starts filling from.",count_up_goal_date:"Optional goal/end date for count-up circle progress",count_up_cycle:'Optional cycle length for count-up progress: "30d", "12h", "90m", "24:00:00", or seconds',title:"Card title - supports templates: \"{{ states('sensor.event_name') }}\"",subtitle:"Shows time remaining by default; only set for custom text"};function Ut(e){var t;if(null==e?void 0:e.label)return e.label;if(Lt[null==e?void 0:e.name])return Lt[e.name];const i=(null!==(t=null==e?void 0:e.name)&&void 0!==t?t:"").toString();return i?i.split("_").map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(" "):""}const Gt=["target_date","creation_date","count_up_goal_date","title","subtitle","expired_text"],Vt=e=>G`<code
    style="background: var(--secondary-background-color);
           padding: 1px 5px;
           border-radius: 3px;
           font-family: var(--ha-font-family-code, monospace);
           font-size: 0.92em;"
>${e}</code>`,jt={section_appearance:()=>G`
        Colours accept ${Vt("#4caf50")}, ${Vt("rgb()")}, a CSS name,
        ${Vt("var(--…)")}, or an entity id.
    `},Wt={date:"Count to a date or entity you choose",timer:"Follow one timer, sensor or input_datetime entity",auto:"Follows any running Alexa or Google Home timer"};class qt extends ne{constructor(){super(...arguments),this.hass=null,this._config={type:"custom:timeflow-card"},this._pendingSource=null,this._templateMode={},this._codeEditorReady=!!customElements.get("ha-code-editor"),this._menuReady=!!customElements.get("ha-control-select-menu"),this._tooltipReady=!!customElements.get("ha-tooltip"),this._templateModeTouched=new Set,this._computeHelper=e=>{const t=jt[null==e?void 0:e.name];return t?t():function(e){return Ft[null==e?void 0:e.name]||""}(e)}}static get styles(){return a`
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
            
            /* Matches the 24px ha-form puts between its own fields, so a field
               we render sits on the same grid as one ha-form renders. */
            .editor-root {
                display: flex;
                flex-direction: column;
                gap: 24px;
            }
            .date-field-container {
                display: flex;
                flex-direction: column;
                gap: 6px;
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
            /* ha-code-editor brings its own CodeMirror styling; the wrapper
               only has to give it the same frame as the date picker beside it
               and stop a long template widening the panel. */
            .template-editor {
                border: 1px solid var(--divider-color);
                border-radius: 4px;
                background: var(--card-background-color);
                padding: 4px 8px;
                overflow: auto;
            }
            .template-editor:focus-within {
                border-color: var(--primary-color);
            }
            .template-editor ha-code-editor {
                --code-mirror-max-height: 120px;
            }
            .template-input {
                width: 100%;
                box-sizing: border-box;
                min-height: 48px;
                padding: 12px;
                border: 1px solid var(--divider-color);
                border-radius: 4px;
                background: var(--card-background-color);
                color: var(--primary-text-color);
                font-family: var(--ha-font-family-code, monospace);
                font-size: 13px;
                line-height: 1.4;
                resize: vertical;
            }
            .template-input:focus {
                outline: none;
                border-color: var(--primary-color);
            }
            .date-helper {
                font-size: 12px;
                color: var(--secondary-text-color);
            }
            /* The date and time inputs come from Home Assistant, so they carry
               the theme's own styling. This only has to stop them huddling on
               the left of a wide panel. */
            .date-picker {
                width: 100%;
            }
            .date-picker ha-form {
                display: block;
                width: 100%;
            }
            /* A section heading, distinct from a field label. */
            .editor-section-label {
                font-weight: 600;
                font-size: 14px;
                color: var(--primary-text-color);
            }
            /* The cursor is the only cue left that the heading has something to
               say - the dotted underline read as a typo rather than an
               affordance. */
            .editor-section-label.has-tooltip {
                align-self: flex-start;
                cursor: help;
            }
            /* The tooltip anchors to the heading by id and paints in an overlay,
               but its host is an inline element - left alone it becomes a flex
               item in the section column and takes a whole gap to itself. */
            ha-tooltip {
                display: contents;
            }

            /* A section: heading plus its fields, grouped by a faint tint
               rather than a rule. The tint is mixed from the text colour, so it
               lands correctly on a light theme and a dark one alike; the flat
               value is the fallback for engines without color-mix. */
            /* A heading and its fields, with no framing of their own. The gap
               matches .editor-section so every section heading sits the same
               distance above its content. */
            .editor-block {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            /* ha-form-grid takes its row gap from --ha-space-6 and its column
               count from --form-grid-column-count, both of which inherit
               through the shadow boundary. A row of toggles does not need the
               24px ha-form puts between full-height fields, and this form holds
               nothing but the grid, so narrowing the token here reaches only
               these toggles. */
            .units-section {
                --form-grid-column-count: 2;
                --ha-space-6: 10px;
            }
            .units-section ha-form {
                display: block;
                width: 100%;
            }

            /* The same, tinted: for a section holding several fields that need
               to read as one group. The tint is mixed from the text colour so
               it lands correctly on a light theme and a dark one alike; the
               flat value is the fallback for engines without color-mix. */
            .editor-section {
                display: flex;
                flex-direction: column;
                gap: 8px;
                padding: 12px;
                border-radius: 12px;
                background: rgba(127, 127, 127, 0.08);
                background: color-mix(in srgb, currentColor 5%, transparent);
            }
            /* Its :host is inline-block with width:auto, so without this it
               sizes to its label instead of lining up with the source picker
               above it. */
            ha-control-select-menu {
                display: block;
                width: 100%;
            }
            ha-control-select {
                /* ha-control-select defaults to 40px, which assumes an icon or
                   a label. Stacking both needs the taller variant Home
                   Assistant uses for its own icon+label selects, or the text
                   collides with the icon above it. */
                --control-select-thickness: 64px;
                --control-select-border-radius: 14px;
                --control-select-padding: 6px;
            }
            .date-fields-section {
                display: flex;
                flex-direction: column;
                gap: 24px;
            }
        `}connectedCallback(){super.connectedCallback(),this._codeEditorReady||customElements.whenDefined("ha-code-editor").then(()=>{this._codeEditorReady=!0}),this._menuReady||customElements.whenDefined("ha-control-select-menu").then(()=>{this._menuReady=!0}),this._tooltipReady||customElements.whenDefined("ha-tooltip").then(()=>{this._tooltipReady=!0})}setConfig(e){var t;this._config={...e};const i=wt(this._config);this._pendingSource&&"date"!==i&&i!==this._pendingSource&&(this._pendingSource=null);for(const s of Gt)this._templateModeTouched.has(s)||(this._templateMode={...this._templateMode,[s]:this._isTemplate(String(null!==(t=e[s])&&void 0!==t?t:""))})}_isTemplate(e){return e.includes("{{")||e.includes("{%")}_toSelectorValue(e){if(!e||this._isTemplate(e))return;const t=new Date(e);if(isNaN(t.getTime()))return;const i=e=>String(e).padStart(2,"0");return`${`${t.getFullYear()}-${i(t.getMonth()+1)}-${i(t.getDate())}`} ${`${i(t.getHours())}:${i(t.getMinutes())}:${i(t.getSeconds())}`}`}_fromSelectorValue(e){if(!e)return"";const t=e.trim().replace(" ","T");return 16===t.length?`${t}:00`:t}_fireConfigChanged(e){this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0}))}_formChanged(e){var t,i,s;const r=(null===(t=e.detail)||void 0===t?void 0:t.value)||{},o=void 0!==(null===(i=this._config)||void 0===i?void 0:i.compact_format),a=this._getEffectiveCompactFormat(),n={...this._config||{},...r,type:(null===(s=this._config)||void 0===s?void 0:s.type)||"custom:timeflow-card"};o||r.compact_format!==a||delete n.compact_format,this._config=n,this._fireConfigChanged(n)}_sectionHeading(e,t,i){return this._tooltipReady?G`
            <span id=${e} class="editor-section-label has-tooltip">${t}</span>
            <ha-tooltip for=${e} placement="bottom-start">${i}</ha-tooltip>
        `:G`
                <span class="editor-section-label">${t}</span>
                <div class="date-helper">${i}</div>
            `}_renderStylePicker(e){const t=e.style||"classic";return G`
            <div class="editor-block">
                <span class="editor-section-label">Card Style</span>
                ${this._menuReady?G`
                        <ha-control-select-menu
                            show-arrow
                            hide-label
                            .label=${"Card Style"}
                            .value=${t}
                            .options=${kt.map(e=>({value:e.value,label:e.label}))}
                            .renderIcon=${e=>{const t=kt.find(t=>t.value===e);return t?G`<ha-icon .icon=${t.icon}></ha-icon>`:j}}
                            @wa-select=${this._styleSelected}
                            @selected=${this._styleSelectedLegacy}
                        ></ha-control-select-menu>
                    `:G`
                        <ha-form
                            .hass=${this.hass}
                            .data=${e}
                            .schema=${[{name:"style",selector:{select:{options:kt,mode:"dropdown"}}}]}
                            @value-changed=${e=>this._formChanged(e)}
                            .computeLabel=${()=>""}
                            .computeHelper=${this._computeHelper}
                        ></ha-form>
                    `}
            </div>
        `}_setStyle(e){var t;if(!e||e===(this._config.style||"classic"))return;const i={...this._config,style:e};"listy"===e&&i.timer_entity&&(i.countdowns=[...null!==(t=i.countdowns)&&void 0!==t?t:[],{timer_entity:i.timer_entity}],delete i.timer_entity),this._config=i,this._fireConfigChanged(i)}_styleSelected(e){var t,i;e.stopPropagation(),this._setStyle(null===(i=null===(t=e.detail)||void 0===t?void 0:t.item)||void 0===i?void 0:i.value)}_styleSelectedLegacy(e){var t,i;e.stopPropagation();const s=null===(t=e.detail)||void 0===t?void 0:t.index;"number"==typeof s&&this._setStyle(null===(i=kt[s])||void 0===i?void 0:i.value)}_renderSourcePicker(e,t){const i={date:{label:"Date",icon:"mdi:calendar"},timer:{label:"Entity",icon:"mdi:timer-outline"},auto:{label:"Smart Timers",icon:"mdi:creation-outline"}},s=function(e){return"listy"===vt(e)?["timer","auto"]:["date","timer","auto"]}(e).map(e=>({value:e,label:i[e].label,ariaLabel:Wt[e],icon:G`<ha-icon .icon=${i[e].icon}></ha-icon>`}));return G`
            <div class="editor-block">
                <span class="editor-section-label">Countdown Source</span>
                <ha-control-select
                    .options=${s}
                    .value=${t}
                    @value-changed=${this._sourceChanged}
                ></ha-control-select>
            </div>
        `}_sourceChanged(e){var t;e.stopPropagation();const i=null===(t=e.detail)||void 0===t?void 0:t.value;if(!i||i===St(this._config,this._pendingSource))return;const s=function(e,t){const i={...e};for(const s of Object.keys($t))if(s!==t)for(const e of $t[s])delete i[e];return"auto"!==t||i.auto_discover_alexa||i.auto_discover_google||(i.auto_discover_alexa=!0,i.auto_discover_google=!0),i}(this._config,i);this._config=s,this._pendingSource=wt(s)===i?null:i,this._fireConfigChanged(s)}_renderDateField(e,t,i){var s;return this._renderTemplatableField(e,t,i,G`
            <div class="date-picker">
                <ha-form
                    .hass=${this.hass}
                    .data=${{[e]:this._toSelectorValue(String(null!==(s=this._config[e])&&void 0!==s?s:""))}}
                    .schema=${[{name:e,selector:{datetime:{}}}]}
                    .computeLabel=${()=>""}
                    @value-changed=${t=>{var i,s,r;return this._updateDateField(e,this._fromSelectorValue(null!==(r=null===(s=null===(i=t.detail)||void 0===i?void 0:i.value)||void 0===s?void 0:s[e])&&void 0!==r?r:""))}}
                ></ha-form>
            </div>
        `)}_renderTitleField(){return this._renderTemplatableField("title","Title","listy"===vt(this._config)?"":"Falls back to the timer or entity name",this._renderPlainTextField("title"),{label:"Text",icon:"mdi:format-text"})}_renderExpiredTextField(){return this._renderTemplatableField("expired_text","Expired Text","Replaces the countdown once it reaches zero",this._renderPlainTextField("expired_text"),{label:"Text",icon:"mdi:format-text"})}_renderSubtitleField(){return this._renderTemplatableField("subtitle","Subtitle","Shows time remaining by default; only set for custom text",this._renderPlainTextField("subtitle"),{label:"Text",icon:"mdi:format-text"})}_renderSourceFields(e,t,i){const s=G`
            <ha-form
                .hass=${this.hass}
                .data=${e}
                .schema=${t}
                @value-changed=${e=>this._formChanged(e)}
                .computeLabel=${Ut}
                .computeHelper=${this._computeHelper}
            ></ha-form>
        `;return"auto"!==i?s:G`
            <div class="editor-section">
                ${this._sectionHeading("sec-auto-discover","Auto Discover","Finds running timers on their own. Turn off whichever assistant you do not have.")}
                ${s}
            </div>
        `}_renderPlainTextField(e){var t;return G`
            <div class="date-picker">
                <ha-form
                    .hass=${this.hass}
                    .data=${{[e]:null!==(t=this._config[e])&&void 0!==t?t:""}}
                    .schema=${[{name:e,selector:{text:{}}}]}
                    .computeLabel=${()=>""}
                    @value-changed=${t=>{var i,s,r;return this._updateDateField(e,null!==(r=null===(s=null===(i=t.detail)||void 0===i?void 0:i.value)||void 0===s?void 0:s[e])&&void 0!==r?r:"")}}
                ></ha-form>
            </div>
        `}_renderTemplatableField(e,t,i,s,r={label:"Picker",icon:"mdi:calendar"}){var o;const a=String(null!==(o=this._config[e])&&void 0!==o?o:""),n=!!this._templateMode[e];return G`
            <div class="date-field-container">
                <div class="date-field-header">
                    <span class="date-field-label">${t}</span>
                    <ha-button
                        appearance="plain"
                        size="small"
                        @click=${()=>this._toggleTemplateMode(e)}
                        title=${n?`Switch back to ${r.label.toLowerCase()}`:"Switch to template/Jinja mode"}
                    >
                        <ha-icon
                            slot="start"
                            icon=${n?r.icon:"mdi:code-braces"}
                        ></ha-icon>
                        ${n?r.label:"Template"}
                    </ha-button>
                </div>

                ${n?G`
                        ${this._codeEditorReady?G`
                                <div class="template-editor">
                                    <ha-code-editor
                                        mode="jinja2"
                                        linewrap
                                        autocomplete-entities
                                        .hass=${this.hass}
                                        .value=${a}
                                        .hasToolbar=${!1}
                                        @value-changed=${t=>{var i,s;return this._updateDateField(e,null!==(s=null===(i=t.detail)||void 0===i?void 0:i.value)&&void 0!==s?s:"")}}
                                    ></ha-code-editor>
                                </div>
                            `:G`
                                <textarea
                                    class="template-input"
                                    rows="2"
                                    spellcheck="false"
                                    .value=${a}
                                    placeholder=${"{{ states('input_datetime.my_date') }}"}
                                    @input=${t=>this._updateDateField(e,t.target.value)}
                                ></textarea>
                            `}
                        <div class="date-helper">Jinja template, entity id, or ISO date string</div>
                    `:G`
                        ${s}
                        ${i?G`<div class="date-helper">${i}</div>`:j}
                    `}
            </div>
        `}_updateDateField(e,t){const i={...this._config,[e]:t};this._config=i,this._fireConfigChanged(i)}_toggleTemplateMode(e){this._templateModeTouched.add(e),this._templateMode={...this._templateMode,[e]:!this._templateMode[e]}}_getEffectiveCompactFormat(){const{show_years:e,show_months:t,show_weeks:i,show_days:s,show_hours:r,show_minutes:o,show_seconds:a,compact_format:n}=this._config;if(void 0!==n)return n;const l=[e,t,i,s,r,o,a].filter(e=>!0===e).length;return l>=3}render(){const e=this._config||{},t="count_up"===e.mode?"count_up":"count_down",i={...e,mode:t,compact_format:this._getEffectiveCompactFormat()},s=St(i,this._pendingSource),r=function(e,t){const i=null!=t?t:wt(e);return[...Et(i,vt(e)),...Dt(e,i)]}(i,s),o=Ot(i,s),a=Ht(i),n=bt(i).timerList?[{type:"tf_countdowns",name:"countdowns"}]:[];const l=function(e){return bt(e).expiredAnimation?[{name:"expired_animation",selector:{boolean:{}}}]:[]}(i),c=function(e){return"listy"===vt(e)?[]:function(e){const t=[];e.timeUnits&&t.push({name:"show_years",selector:{boolean:{}}},{name:"show_months",selector:{boolean:{}}},{name:"show_weeks",selector:{boolean:{}}},{name:"show_days",selector:{boolean:{}}},{name:"show_hours",selector:{boolean:{}}},{name:"show_minutes",selector:{boolean:{}}}),e.showSeconds&&t.push({name:"show_seconds",selector:{boolean:{}}});const i=[];return t.length>0&&i.push({type:"grid",schema:t}),e.compactFormat&&i.push({name:"compact_format",selector:{boolean:{}}}),i}(bt(e))}(i),d=function(e){const t=bt(e);return[...It(t),...Nt(t),...Rt(t),...zt(t),...Pt(t),{type:"expandable",name:"section_actions",flatten:!0,title:"Tap Actions",icon:"mdi:gesture-tap",schema:[{name:"tap_action",selector:{ui_action:{}}},{name:"hold_action",selector:{ui_action:{}}},{name:"double_tap_action",selector:{ui_action:{}}}]}]}(i),u=bt(i),h=u.title,m=u.subtitle,p=u.expiredText,_="listy"===vt(i),g=xt(s)?G`
            <div class="date-fields-section">
                ${this._renderDateField("target_date","count_up"===t?"Start Date":"Target Date","count_up"===t?"Date/time the elapsed count begins":"Date/time when countdown ends")}

                ${"count_up"===t?this._renderDateField("count_up_goal_date","Goal Date","Optional end date for count-up progress"):this._renderDateField("creation_date","Start Date","Where the progress ring starts filling from. Without it the ring stays empty.")}
            </div>
        `:j;return G`
            <div class="editor-root">
            ${this._renderStylePicker(i)}
            ${_?j:this._renderSourcePicker(i,s)}
            ${g}
            ${_?j:this._renderSourceFields(i,r,s)}
            ${_&&h?this._renderTitleField():j}
            <!-- computeLabel is deliberately not blanked here: ha-form hands it
                 down to every field inside an entry, and blanking it left them
                 all unlabelled. The repeater ignores its own label. -->
            ${n.length>0?G`
                <div class="editor-section">
                    ${this._sectionHeading("sec-pinned","Pinned Countdowns","Always shown, alongside anything discovery finds.")}
                    <ha-form
                        .hass=${this.hass}
                        .data=${i}
                        .schema=${n}
                        @value-changed=${e=>this._formChanged(e)}
                        .computeLabel=${Ut}
                        .computeHelper=${this._computeHelper}
                    ></ha-form>
                </div>
            `:j}
            ${a.length>0?G`
                <div class="editor-section">
                    ${this._sectionHeading("sec-discovery","Auto Discovery","Finds running Alexa and Google Home timers on their own.")}
                    <ha-form
                        .hass=${this.hass}
                        .data=${i}
                        .schema=${a}
                        @value-changed=${e=>this._formChanged(e)}
                        .computeLabel=${Ut}
                        .computeHelper=${this._computeHelper}
                    ></ha-form>
                </div>
            `:j}
            ${!_&&h?this._renderTitleField():j}
            ${m?this._renderSubtitleField():j}
            ${o.length>0?G`
                <div class="date-field-container">
                    <ha-form
                        .hass=${this.hass}
                        .data=${i}
                        .schema=${o}
                        @value-changed=${e=>this._formChanged(e)}
                        .computeLabel=${Ut}
                        .computeHelper=${this._computeHelper}
                    ></ha-form>
                    <div class="date-helper">
                        Wrap the automatic countdown, e.g. "in" 3 days "left". Ignored when you set a Subtitle.
                    </div>
                </div>
            `:j}
            ${p?this._renderExpiredTextField():j}
            <ha-form
                .hass=${this.hass}
                .data=${i}
                .schema=${l}
                @value-changed=${e=>this._formChanged(e)}
                .computeLabel=${Ut}
                .computeHelper=${this._computeHelper}
            ></ha-form>
            ${c.length>0?G`
                <div class="editor-section units-section">
                    <span class="editor-section-label">${u.timeUnits?"Time Units":"Time Format"}</span>
                    <ha-form
                        .hass=${this.hass}
                        .data=${i}
                        .schema=${c}
                        @value-changed=${e=>this._formChanged(e)}
                        .computeLabel=${Ut}
                        .computeHelper=${this._computeHelper}
                    ></ha-form>
                </div>
            `:j}
            <ha-form
                .hass=${this.hass}
                .data=${i}
                .schema=${d}
                @value-changed=${e=>this._formChanged(e)}
                .computeLabel=${Ut}
                .computeHelper=${this._computeHelper}
            ></ha-form>
            </div>
        `}}e([ue({type:Object})],qt.prototype,"hass",void 0),e([he()],qt.prototype,"_config",void 0),e([he()],qt.prototype,"_pendingSource",void 0),e([he()],qt.prototype,"_templateMode",void 0),e([he()],qt.prototype,"_codeEditorReady",void 0),e([he()],qt.prototype,"_menuReady",void 0),e([he()],qt.prototype,"_tooltipReady",void 0),customElements.get("error-display")||customElements.define("error-display",st),customElements.get("progress-circle")||customElements.define("progress-circle",ut),customElements.get("progress-grid")||customElements.define("progress-grid",ht),customElements.get("timeflow-card")||customElements.define("timeflow-card",dt),customElements.get("timeflow-card-editor")||customElements.define("timeflow-card-editor",qt),window.customCards=window.customCards||[],window.customCards.some(e=>"timeflow-card"===e.type)||window.customCards.push({type:"timeflow-card",name:"TimeFlow Card",description:"A beautiful countdown timer card with progress circle for Home Assistant, using Lit",preview:!0,documentationURL:"https://github.com/Rishi8078/TimeFlow-Card"});export{st as ErrorDisplay,ut as ProgressCircle,ht as ProgressGrid,dt as TimeFlowCard,qt as TimeFlowCardEditor};
//# sourceMappingURL=timeflow-card.js.map
