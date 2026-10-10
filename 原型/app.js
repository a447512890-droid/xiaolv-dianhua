const PAGES = [
  {id:"dial", group:"沟通", title:"拨号", desc:"输入号码，点击呼叫。", modules:["dialNumberInput","dialKeypad","callModeSelection"]},
  {id:"customers", group:"通讯录", title:"通讯录", desc:"查看联系人或最近沟通记录。", modules:["contactDirectory","customerCommunicationHistory","callSearch"]},
  {id:"customer-edit", group:"通讯录", title:"联系人资料维护", desc:"维护公司、职务、关注事项、备注及最多 10 个电话号码。", modules:["customerProfileEdit","customerPhoneNumbers"]},
  {id:"prep", group:"通讯录", title:"拨打前回顾", desc:"带着上次的结论和约定开始沟通。", modules:["callPrepCustomerContext","customerPhoneNumbers"]},
  {id:"live", group:"沟通", title:"通话中看板", desc:"在通话中快速查阅联系人背景与通话状态。", modules:["callStatusControls","callCustomerContext","previousCommunication","agreementsAndTodos","unmatchedCustomer"]},
  {id:"review", group:"沟通", title:"通话总结", desc:"回顾沟通摘要、关键要点与约定。", modules:["callSummary","callCommunicationHighlights","callTranscript","callActionItemExtraction","actionItemConfirmation"]},
  {id:"action", group:"沟通", title:"待办详情", desc:"查看自动创建的待办，编辑事项和截止时间。", modules:["callActionItemExtraction","actionItemConfirmation","iosRemindersExport"]},
  {id:"todos", group:"待办", title:"待办", desc:"查看待办；通过标签页切换空状态与有待办状态。", modules:["actionItemConfirmation"]},
  {id:"history", group:"记录", title:"沟通历史", desc:"按联系人回看每次记录和跟进。", modules:["customerCommunicationHistory","callSearch"]},
  {id:"mine", group:"我的", title:"我的", desc:"查看账号资料、会员状态和订阅方案。", modules:["userAccountProfile","membershipSubscription","membershipAccess"]},
  {id:"structure", group:"文档", title:"联系人字段需求", desc:"梳理联系人资料、关联记录、待办与分析字段。", modules:[]},
  {id:"requirements", group:"文档", title:"需求列表", desc:"查看当前产品规格草案中的模块需求。", modules:[]},
  {id:"checklist", group:"文档", title:"功能清单", desc:"查看产品功能范围与状态。", modules:[]},
  {id:"changelog", group:"文档", title:"更新日志", desc:"回顾需求原型与规格的实际调整。", modules:[]},
  {id:"metadata", group:"文档", title:"产品描述", desc:"查看 App Store 产品描述与元数据。", modules:[]},
  {id:"store", group:"文档", title:"商店图", desc:"浏览 App Store 截图。", modules:[]}
];
const SOURCE_LINES = [
  {time:"00:18",speaker:"我",text:"周末活动安排在什么时候？"},
  {time:"00:42",speaker:"对方",text:"周六下午可以，集合地点还没定。"},
  {time:"02:18",speaker:"对方",text:"周五前能把活动时间表和物品清单发给我吗？"},
  {time:"02:29",speaker:"我",text:"可以，我周五前把活动时间表和物品清单发给您。"},
  {time:"02:40",speaker:"对方",text:"我来确认参加人数。"}
];

const state = {page:"dial", memberActive:false, subscriptionPlan:"month", specKey:null, specOpen:false, callMode:"todo", mineView:"nonmember", todosView:"has", reviewTab:"highlights", contactsTab:"contacts", metadataTab:"primary", storeTab:"待办版", actionTitle:"周五前发送活动时间表和物品清单", actionDue:"2026-10-16", taskDone:false, taskDeleted:false, search:"", historySearch:"", navSearch:"", docSearch:"", dialNumber:"", callMatched:true, callStartedAt:null, muted:false, speaker:false, toastTimer:null};
const customer={name:"王先生",company:"北辰科技",position:"活动组织者",focus:"活动时间、物品准备",notes:"",phones:["13800000000"]};
let customerDraft=null;
const customerLabel=()=>[customer.name,customer.company].filter(Boolean).join(" · ");
const customerMeta=()=>[customer.company,customer.position].filter(Boolean).join(" · ");
const $ = (sel) => document.querySelector(sel);
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"})[c]);
const moduleButton = (key) => `<button type="button" class="module-link" data-module="${key}" aria-label="查看模块说明" aria-pressed="${state.specKey===key}"><span class="annotation-dot" aria-hidden="true"></span></button>`;
const card = (key,title,content,extra="") => `<section class="card ${extra}" data-module-card="${key}"><div class="card-title-row"><span class="card-title">${title}</span>${moduleButton(key)}</div>${content}</section>`;
const btn = (label,go,cls="primary-button") => `<button type="button" class="${cls}" data-go="${go}">${label}</button>`;
const pageHeader = (title,back="customers",action="") => `<div class="app-header"><div style="display:flex;align-items:center"><button class="back-button" type="button" data-go="${back}" aria-label="返回">‹</button><h2 class="small-title">${title}</h2></div>${action}</div>`;
const bottom = (content) => `<div class="bottom-bar">${content}</div>`;
const hasMembership=()=>state.mineView==="member";
const tabs = (active) => `<div class="app-footer-tabs"><button type="button" data-go="dial" class="${active==="dial"?"active":""}"><span>◉</span>沟通</button><button type="button" data-go="customers" class="${active==="customers"?"active":""}"><span>⌂</span>通讯录</button><button type="button" data-go="todos" class="${active==="todos"?"active":""}"><span>☑</span>待办</button><button type="button" data-go="history" class="${active==="history"?"active":""}"><span>≡</span>记录</button><button type="button" data-go="mine" class="${active==="mine"?"active":""}"><span>◉</span>我的</button></div>`;

const validDialNumber = number => /^1\d{10}$/.test(number);
function renderDial(){
  const keys=[["1",""],["2","ABC"],["3","DEF"],["4","GHI"],["5","JKL"],["6","MNO"],["7","PQRS"],["8","TUV"],["9","WXYZ"],["*", ""],["0",""],["#",""]];
  return `<div class="app-header"><h2>沟通</h2></div><div class="app-body dial-body"><div class="dial-input-region">${moduleButton("dialNumberInput")}<div class="dial-number-box"><span class="dial-country" aria-label="中国区号">+86</span><input id="dial-number" type="tel" inputmode="numeric" autocomplete="tel-national" data-input="dial-number" aria-label="手机号码" aria-invalid="${!!state.dialNumber&&!validDialNumber(state.dialNumber)}" placeholder="输入手机号码" value="${esc(state.dialNumber)}"><button type="button" class="dial-delete" data-action="dial-delete" aria-label="删除一位号码">⌫</button></div></div><div class="dial-pad" aria-label="拨号键盘">${keys.map(([digit,letters])=>`<button type="button" class="dial-key" data-digit="${digit}" aria-label="数字 ${digit}" ${/^[0-9]$/.test(digit)?"":"disabled"}><strong>${digit}</strong><small>${letters||"&nbsp;"}</small></button>`).join("")}</div><div class="dial-call-row"><button type="button" class="dial-call" data-action="place-call" aria-label="${state.callMode==="normal"?"使用系统电话呼叫":"使用待办电话呼叫"}" ${validDialNumber(state.dialNumber)?"":"disabled"}>${hasMembership()?"呼叫":"开通会员后呼叫"}</button><div class="call-mode-control">${moduleButton("callModeSelection")}<select data-input="call-mode" aria-label="呼叫模式"><option value="todo" ${state.callMode==="todo"?"selected":""}>待办拨号</option><option value="normal" ${state.callMode==="normal"?"selected":""}>普通拨号</option></select></div></div></div>${tabs("dial")}`;
}

function requireMembership(){
  if(hasMembership())return true;
  go("mine");showToast("开通会员后可呼叫并生成新的总结和待办");return false;
}
function renderMemberRequired(){
  return `${pageHeader("会员专属","dial")}<div class="app-body"><div class="empty-state"><span class="empty-icon">♛</span><strong>开通会员，接续每一次沟通</strong><p>会员可呼叫并生成新的总结和待办。非会员可查看过去的总结和待办。</p>${btn("查看会员方案","mine","secondary-button")}</div></div>${tabs("dial")}`;
}
function renderMine(){
  const member=hasMembership();
  const plans=[["week","周会员","按周订阅"],["month","月会员","按月订阅"],["year","年会员","按年订阅"]];
  return `<div class="app-header"><h2>我的</h2></div><div class="app-body no-footer">${card("userAccountProfile","个人信息",`<div class="person-row"><span class="avatar mint">电</span><div class="person-info"><strong>电话用户</strong><span>ID：10000001</span></div></div>`)}${card("membershipAccess","会员状态",`<div class="membership-banner ${member?"active":""}"><span class="membership-crown">♛</span><div><strong>${member?"会员有效":"尚未开通会员"}</strong><p>${member?"可呼叫并生成新的总结和待办":"可查看过去的总结和待办"}</p></div></div><div class="info-row"><span>当前状态</span><strong>${member?"订阅有效":"非会员"}</strong></div>${member?`<div class="info-row"><span>订阅方案</span><strong>月会员</strong></div><div class="info-row"><span>到期时间</span><strong>待订阅服务返回</strong></div>`:""}<div class="membership-rights"><p>✓ 查看历史总结和待办</p><p class="${member?"":"locked"}">${member?"✓":"♧"} 呼叫联系人</p><p class="${member?"":"locked"}">${member?"✓":"♧"} 生成新的总结和待办</p></div>`)}${card("membershipSubscription","会员充值",`<p class="body-copy">选择订阅周期，开通持续沟通与跟进能力。</p><div class="subscription-plans" role="group" aria-label="订阅周期">${plans.map(([id,title,cycle])=>`<button type="button" class="subscription-plan ${state.subscriptionPlan===id?"selected":""}" data-subscription-plan="${id}" aria-pressed="${state.subscriptionPlan===id}"><strong>${title}</strong><span>价格待确认</span><small>${cycle}</small></button>`).join("")}</div><button type="button" class="primary-button" data-action="subscribe-membership">${member?"管理订阅":"开通会员"}</button><p class="subscription-note">订阅价格、续费与取消规则待确认。支付接入尚未配置。</p>`)}<button type="button" class="ghost-button" data-go="history">查看历史沟通记录 →</button></div>${tabs("mine")}`;
}

function renderCustomers(){
  const recent=state.contactsTab==="recent";
  const query=state.search.trim();
  const visible=!query||[customer.name,customer.company,...customer.phones].join(" ").includes(query);
  const records=[{date:"10 月 10 日 · 10:30",title:"活动安排",text:"关注活动时间、物品准备及价格，约定周五前补充报价。",page:"review"},{date:"10 月 8 日 · 15:00",title:"方案讨论",text:"认可方案方向，希望了解部署周期和支持范围。",page:"prep"}];
  const shown=records.filter(r=>!query||`${customerLabel()} ${r.title} ${r.text}`.includes(query));
  const content=recent?shown.map(r=>`<div class="record-date">${r.date}</div><button type="button" class="card record-card" data-go="${r.page}" style="width:100%;text-align:left"><div class="person-row"><span class="avatar mint">王</span><div class="person-info"><strong>王先生</strong><span>${esc(customer.company)} · ${r.title}</span></div><span class="chevron">›</span></div><p>${r.text}</p></button>`).join("")||`<div class="empty-state"><strong>没有匹配的沟通记录</strong>试试联系人名称或沟通关键词。</div>`:visible?`<div class="section-label">联系人</div><button type="button" class="list-button" data-go="prep"><span class="avatar mint">王</span><span class="list-main"><strong>王先生</strong><small>${esc([customer.company,customer.phones[0]].filter(Boolean).join(" · "))}</small></span><span class="chevron">›</span></button><button type="button" class="ghost-button" data-go="customer-edit">维护联系人资料 →</button>`:`<div class="empty-state"><strong>没有匹配的联系人</strong>试试姓名、公司或电话号码。</div>`;
  return `<div class="app-header"><h2>通讯录</h2></div><div class="tab-row contacts-tabs" role="tablist" aria-label="通讯录内容"><button type="button" id="contacts-tab" role="tab" aria-controls="contacts-panel" aria-selected="${!recent}" class="tab-button ${!recent?"active":""}" data-contacts-tab="contacts">通讯录</button><button type="button" id="recent-tab" role="tab" aria-controls="contacts-panel" aria-selected="${recent}" class="tab-button ${recent?"active":""}" data-contacts-tab="recent">最近沟通记录</button></div><div class="app-body no-footer" id="contacts-panel" role="tabpanel" aria-labelledby="${recent?"recent-tab":"contacts-tab"}"><label class="app-search"><span aria-hidden="true">⌕</span><input type="search" data-input="search" placeholder="${recent?"搜索姓名、沟通关键词":"搜索姓名、公司、电话"}" value="${esc(state.search)}" aria-label="${recent?"搜索最近沟通记录":"搜索通讯录"}"></label>${content}</div>${tabs("customers")}`;
}

function renderCustomerEdit(){
  if(!customerDraft)customerDraft={...customer,phones:[...customer.phones]};
  const d=customerDraft;
  const field=(key,label,multi=false)=>`<label class="field-label" for="customer-${key}">${label}</label>${multi?`<textarea id="customer-${key}" class="input-field" rows="3" data-customer-field="${key}">${esc(d[key])}</textarea>`:`<input id="customer-${key}" class="input-field" data-customer-field="${key}" value="${esc(d[key])}">`}`;
  return `${pageHeader("联系人资料维护","customers")}<div class="app-body"><h1 class="page-title">${esc(customer.name)}</h1><p class="page-desc">维护联系人背景与联系电话</p>${card("customerProfileEdit","联系人信息",field("company","组织／公司")+field("position","职务")+field("focus","关注事项",true)+field("notes","备注",true))}${card("customerPhoneNumbers","电话号码",`<p class="body-copy">${d.phones.length} / 10 个号码 · 第一个号码用于优先联系</p><div class="customer-phones">${d.phones.map((phone,index)=>`<div class="customer-phone-row"><span class="dial-country">+86</span><input class="input-field" type="tel" inputmode="numeric" data-customer-phone="${index}" aria-label="电话号码 ${index+1}" value="${esc(phone)}" placeholder="11 位手机号码"><button type="button" class="micro-button" data-remove-phone="${index}" aria-label="删除电话号码 ${index+1}">删除</button></div>`).join("")}</div><button type="button" class="secondary-button" data-action="add-customer-phone" ${d.phones.length>=10?"disabled":""}>＋ 添加电话号码</button>`)}<div class="button-row"><button type="button" class="secondary-button" data-action="cancel-customer-edit">取消</button><button type="button" class="primary-button" data-action="save-customer">保存资料</button></div></div>`;
}

function renderPrep(){
  return `${pageHeader("拨打前回顾","customers",`<button type="button" class="ghost-button" data-go="customer-edit">编辑资料</button>`)}<div class="app-body"><div class="overline">BEFORE THE CALL</div><h1 class="page-title">先看上次说到哪</h1><p class="page-desc">${esc(customerLabel())}</p>${card("callPrepCustomerContext","联系人摘要",`<div class="person-row"><span class="avatar mint">王</span><div class="person-info"><strong>王先生</strong><span>${esc(customerMeta())}</span></div></div><div class="tag-row"><span class="tag">朋友</span><span class="tag gray">活动安排中</span></div><div class="info-row"><span>关注事项</span><strong>${esc(customer.focus)||"未填写"}</strong></div><div class="info-row"><span>备注</span><strong>${esc(customer.notes)||"未填写"}</strong></div>`)}${card("customerPhoneNumbers","联系电话",customer.phones.length?customer.phones.map((phone,index)=>`<div class="compact-row" style="margin:8px 0"><span class="body-copy">+86 ${esc(phone)}</span><button type="button" class="micro-button" data-call-customer-phone="${index}">呼叫</button></div>`).join(""):`<p class="body-copy">尚未填写电话号码</p>`)}${card("callPrepCustomerContext","最近沟通摘要",`<div class="body-copy">上次联系人认可方案方向，希望进一步了解部署周期、物品准备和时间表。</div><div class="source">已保存沟通记录 · 10 月 8 日</div>`)}${card("callPrepCustomerContext","未完成约定",`<div class="task-row"><span class="check-circle"></span><div><strong>补充实施计划与支持说明</strong><small>来自上次沟通 · 待确认进度</small></div></div>`)}</div>${bottom(btn("进入通话看板 →","live"))}`;
}

function renderLive(){
  if(!state.callStartedAt)state.callStartedAt=Date.now();
  const target=state.callMatched?"王先生":state.dialNumber?`+86 ${state.dialNumber}`:"未关联号码";
  const meta=state.callMatched?esc(customer.company):"号码未匹配联系人";
  const board=state.callMatched?`${card("callCustomerContext","联系人资料",`<div class="person-row"><span class="avatar mint">王</span><div class="person-info"><strong>王先生</strong><span>${esc(customerMeta())}</span></div></div><div class="tag-row"><span class="tag">朋友</span><span class="tag gray">活动筹备</span></div>`)}${card("previousCommunication","上次沟通",`<div class="body-copy">上次讨论了周末活动安排，本次继续确认时间和物品准备。</div><div class="source">10 月 8 日 · 用户已保存的沟通摘要</div>`)}${card("agreementsAndTodos","约定与待办",renderTaskBlock())}`:`${card("unmatchedCustomer","未关联联系人",`<div class="body-copy">当前号码没有匹配到联系人，暂无历史总结、约定和待办。</div><button type="button" class="ghost-button" data-action="match-contact">关联联系人 →</button>`)}`;
  const icon=(paths)=>`<svg viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  const mic=icon(`<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/>${state.muted?'<path d="M3 3l18 18"/>':""}`);
  const speaker=icon(`<path d="M11 5 6 9H3v6h3l5 4z"/>${state.speaker?'<path d="M15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/>':'<path d="m16 9 5 6m0-6-5 6"/>'}`);
  const hangup=icon('<path d="M3 14c5-5 13-5 18 0l-2 4-4-2v-3a14 14 0 0 0-6 0v3l-4 2z" fill="currentColor" stroke="none"/>');
  return `<div class="call-top"><div class="call-state-row"><span class="call-active"><i></i>通话中</span>${moduleButton("callStatusControls")}</div><div class="person-row"><span class="avatar">${state.callMatched?"王":"#"}</span><div class="person-info"><strong>${esc(target)}</strong><span>${meta}</span></div><div class="call-duration"><strong id="call-elapsed" aria-live="off" aria-label="通话时长">${formatElapsed()}</strong></div></div><div class="call-controls"><button type="button" class="call-control ${state.muted?"is-on":""}" data-action="toggle-mute" aria-label="${state.muted?"取消静音":"静音"}" aria-pressed="${state.muted}" title="${state.muted?"取消静音":"静音"}">${mic}</button><button type="button" class="call-control ${state.speaker?"is-on":""}" data-action="toggle-speaker" aria-label="扬声器" aria-pressed="${state.speaker}" title="扬声器">${speaker}</button><button type="button" class="call-control end" data-action="call-hangup" aria-label="挂断" title="挂断">${hangup}</button></div></div><div class="call-board"><div class="board-grip"></div><div class="app-body">${board}</div></div>`;
}

function renderReviewContent(){
  if(state.reviewTab==="transcript")return card("callTranscript","完整转录",SOURCE_LINES.map(l=>`<div class="transcript-line"><span class="timestamp">${l.time}</span><span><span class="speaker">${l.speaker}</span>　${l.text}</span></div>`).join(""));
  if(state.reviewTab==="recording")return card("callTranscript","录音播放",`<p class="body-copy">录音文件保存在服务器。</p><button class="secondary-button" type="button" disabled aria-label="录音服务尚未接入">播放录音</button><p class="source">录音服务尚未接入，当前没有可播放文件。</p>`);
  return `${card("callSummary","沟通摘要",`<p class="body-copy">双方讨论了活动安排，确认周六下午开展活动。我将在周五前发送时间表和物品清单，对方负责确认参加人数，集合地点尚未确定。</p>`)}${card("callCommunicationHighlights","关键要点",`<ul class="body-copy"><li>活动安排在周六下午。<div class="source">对方 · 00:42</div></li><li>集合地点尚未确定。<div class="source">对方 · 00:42</div></li></ul><div class="quote">“周六下午可以，集合地点还没定。”<div class="source">对方 · 00:42 · 完整转录</div></div>`)}`;
}

function taskControls(){
  if(state.taskDeleted||!hasMembership())return "";
  return state.taskDone?`<button type="button" class="micro-button" data-action="delete-task">删除待办</button>`:`<button type="button" class="secondary-button" data-action="edit-task">编辑待办</button><button type="button" class="micro-button" data-action="toggle-task">标记完成</button>`;
}
function renderTaskBlock(){
  if(state.taskDeleted)return `<div class="empty-state"><strong>暂无待办</strong></div>`;
  return `<div class="compact-row"><span class="tag">自动创建</span><span class="tag ${state.taskDone?"":"amber"}">${state.taskDone?"已完成":"待完成"}</span></div><div class="body-copy" style="margin-top:12px"><strong>${esc(state.actionTitle)}</strong></div><div class="source">${esc(customerLabel())} · 执行方：我 · 截止 ${esc(state.actionDue)}</div><div class="quote">“我周五前把活动时间表和物品清单发给您。”<div class="source">我 · 02:29 · 通话转录</div></div><div class="button-row">${taskControls()}</div><button type="button" class="ghost-button" data-go="action">查看详情 →</button>`;
}

function renderReview(){
  const agreements=state.reviewTab==="highlights"?card("callActionItemExtraction","约定与待办",`<div class="section-label">我的待办</div>${renderTaskBlock()}<div class="section-label">对方约定</div><p class="body-copy">确认活动参加人数</p><div class="source">执行方：对方 · 截止时间：未约定</div><div class="quote">“我来确认参加人数。”<div class="source">对方 · 02:40 · 完整转录</div></div>`):"";
  return `${pageHeader("通话总结","history")}<div class="app-body" style="padding-bottom:7px"><div class="person-row"><span class="avatar mint">王</span><div class="person-info"><strong>${esc(customerLabel())}</strong><span>10 月 10 日 · 约 3 分钟</span></div></div></div><div class="tab-row"><button type="button" class="tab-button ${state.reviewTab==="highlights"?"active":""}" data-tab="highlights">总结</button><button type="button" class="tab-button ${state.reviewTab==="transcript"?"active":""}" data-tab="transcript">完整转录</button><button type="button" class="tab-button ${state.reviewTab==="recording"?"active":""}" data-tab="recording">录音播放</button></div><div class="app-body">${renderReviewContent()}${agreements}</div>${bottom(btn("查看全部待办 →","todos"))}`;
}

function renderAction(){
  if(state.taskDeleted)return `${pageHeader("待办详情","todos")}<div class="app-body"><div class="empty-state"><strong>该待办已删除</strong></div></div>${bottom(btn("返回待办列表","todos"))}`;
  return `${pageHeader("待办详情","todos")}<div class="app-body"><div class="overline">FROM WORDS TO ACTION</div><h1 class="page-title">约定已成为待办</h1><p class="page-desc">通话中的明确约定自动创建为待办；未完成可编辑，完成后仅可删除。</p>${card("actionItemConfirmation","待办详情",`<span class="tag">自动创建</span><div class="info-row"><span>事项</span><strong>${esc(state.actionTitle)}</strong></div><div class="info-row"><span>执行方</span><strong>我</strong></div><div class="info-row"><span>截止</span><strong>${esc(state.actionDue)}</strong></div><div class="info-row"><span>状态</span><strong>${state.taskDone?"已完成":"待完成"}</strong></div><div class="info-row"><span>关联联系人</span><strong>${esc(customerLabel())}</strong></div><div class="button-row">${taskControls()}</div>`)}${card("callActionItemExtraction","原文依据",`<div class="quote">“我周五前把活动时间表和物品清单发给您。”<div class="source">我 · 02:29 · 通话转录</div></div><button type="button" class="ghost-button" data-go="review">查看来源通话 →</button>`)}${card("iosRemindersExport","系统提醒事项 · 可选方案",`<div class="body-copy">App 内待办已自动创建；与 iOS 提醒事项联动尚待确认。</div><span class="tag gray">规划讨论中</span>`)}</div>${bottom(btn("查看待办列表 →","todos"))}`;
}

function renderTodos(){
  const empty=state.todosView==="empty"||state.taskDeleted;
  const task=empty?`<div class="empty-state"><span class="empty-icon">☑</span><strong>暂无待办</strong><p>通话结束后，明确的承诺和约定会自动生成待办。</p><div style="margin-top:16px">${btn("去拨打电话","dial","secondary-button")}</div></div>`:renderTaskBlock();
  return `<div class="app-header"><h2>待办</h2><span class="tag">${empty?"0 项待办":"1 项待办"}</span></div><div class="app-body no-footer"><div class="overline">KEEP THE PROMISE</div><h1 class="page-title">把约定逐一完成</h1><p class="page-desc">${hasMembership()?"通话约定自动生成待办，未完成时可编辑。":"可查看过去的待办；开通会员后可呼叫并生成新内容。"}</p>${card("actionItemConfirmation","待办事项",task)}${!empty?card("actionItemConfirmation","任务与沟通关联",`<div class="body-copy">任务保留关联联系人、来源通话和原文依据，编辑后仍可回看来源。</div><button type="button" class="ghost-button" data-go="history">查看联系人沟通历史 →</button>`):""}</div>${tabs("todos")}`;
}

function renderHistory(){
  const match = !state.historySearch || `${customerLabel()} 活动时间 售后 报价 方案`.includes(state.historySearch.trim());
  return `<div class="app-header"><h2>沟通记录</h2><span class="tag">联系人视图</span></div><div class="app-body no-footer"><div class="overline">COMMUNICATION MEMORY</div><h1 class="page-title">联系人说过什么，随时回看</h1><p class="page-desc">按联系人、时间或关键词查找已保存的记录。</p><label class="app-search"><span aria-hidden="true">⌕</span><input type="search" data-input="history-search" placeholder="搜索联系人、关键词" value="${esc(state.historySearch)}" aria-label="搜索联系人沟通记录"></label>${match?`<div class="record-date">10 月 10 日</div><button type="button" class="card record-card" data-go="review" style="width:100%;text-align:left"><div class="person-row"><span class="avatar mint">王</span><div class="person-info"><strong>王先生</strong><span>${esc(customer.company)} · 活动安排</span></div><span class="chevron">›</span></div><p>“主要看活动时间和物品准备，集合地点还没确定。”</p><div class="tag-row"><span class="tag">活动安排</span><span class="tag gray">活动约定</span></div></button><div class="record-date">10 月 8 日 · 已保存沟通</div><button type="button" class="card record-card" data-go="prep" style="width:100%;text-align:left"><div class="person-row"><span class="avatar mint">王</span><div class="person-info"><strong>王先生</strong><span>${esc(customer.company)} · 上次摘要</span></div><span class="chevron">›</span></div><p>上次讨论了周末活动安排，尚需确认参加人数和集合地点。</p></button>`:`<div class="empty-state"><span class="empty-icon">⌕</span><strong>没有匹配记录</strong>试试“活动时间”“清单”或联系人名称。</div>`}${card("customerCommunicationHistory","记录范围",`<div class="body-copy">仅展示已确认保存并关联到该联系人的沟通记录。</div>`)}</div>${tabs("history")}`;
}

const MODULE_PAGE = {
  contactDirectory:"customers",customerProfileEdit:"customer-edit",userAccountProfile:"mine",membershipSubscription:"mine",membershipAccess:"mine",customerPhoneNumbers:"customer-edit",callModeSelection:"dial",dialNumberInput:"dial",dialKeypad:"dial",callPrepCustomerContext:"prep",callInProgressBoard:"live",callCustomerContext:"live",previousCommunication:"live",agreementsAndTodos:"live",unmatchedCustomer:"live",callStatusControls:"live",
  callSummary:"review",callTranscript:"review",callCommunicationHighlights:"review",
  callActionItemExtraction:"review",actionItemConfirmation:"action",iosRemindersExport:"action",
  customerCommunicationHistory:"history",callSearch:"history"
};
let requirementsRows=[];
let changelogRows=[];
function renderRequirementsDocument(){
  const all=requirementsRows.map(row=>[row.模块标识,{标题:row.需求名称,模块说明:row.需求描述,序号:row.序号}]);
  const q=state.docSearch.trim().toLowerCase();
  const filtered=all.filter(([key,note])=>!q||`${key} ${note.标题} ${note.模块说明}`.toLowerCase().includes(q));
  const rows=filtered.map(([key,note],i)=>{const page=MODULE_PAGE[key];return `<tr><td class="doc-index">${esc(note.序号)}</td><td class="doc-name"><strong>${esc(note.标题)}</strong><small>${esc(key)}</small></td><td class="doc-description">${esc(note.模块说明)}</td><td>${page?`<button type="button" class="doc-row-link" data-open-module="${esc(key)}">查看原型 →</button>`:`<span class="doc-muted">待设计</span>`}</td></tr>`}).join("");
  return `<article class="doc-card"><div class="doc-eyebrow">PRODUCT REQUIREMENTS</div><div class="metadata-top"><h1>需求列表</h1><button type="button" class="secondary-button" data-action="reload-document">刷新内容</button></div><p class="doc-lead">按沟通流程汇总的模块需求，内容来自《需求列表.md》；点击条目可定位对应原型。</p><div class="doc-badges"><span>产品规格草案</span><span>${all.length} 项模块需求</span><span>版本号待确认</span></div><div class="doc-toolbar"><label class="doc-search"><span aria-hidden="true">⌕</span><input type="search" data-input="doc-search" placeholder="搜索需求名称或描述" value="${esc(state.docSearch)}" aria-label="搜索需求"></label></div><div class="doc-result-count">当前显示 ${filtered.length} / ${all.length} 项</div><div class="doc-table-wrap"><table class="doc-table requirements-table"><thead><tr><th>序号</th><th>需求名称</th><th>需求描述</th><th>原型入口</th></tr></thead><tbody>${rows||`<tr><td colspan="4" class="doc-empty">没有匹配的需求，请调整搜索词。</td></tr>`}</tbody></table></div><p class="doc-footnote">说明：列表是规格草案与原型映射，不代表功能已开发或通过技术验证。</p></article>`;
}
function renderChangelogDocument(){
  const changes=changelogRows.slice().reverse();
  const latest=changes.reduce((date,item)=>item.日期>date?item.日期:date,"")||"—";
  return `<article class="doc-card"><div class="doc-eyebrow">PROJECT HISTORY</div><div class="metadata-top"><h1>更新日志</h1><button type="button" class="secondary-button" data-action="reload-document">刷新内容</button></div><p class="doc-lead">待办电话需求原型的页面调整与需求记录。</p><div class="doc-badges"><span>最近更新 ${esc(latest.replaceAll("-","/"))}</span><span>${changes.length} 条记录</span></div><div class="doc-table-wrap"><table class="doc-table changelog-table"><thead><tr><th>修改时间</th><th>属性</th><th>描述</th><th>修改人</th></tr></thead><tbody>${changes.map(item=>`<tr><td class="doc-date">${esc(item.日期.replaceAll("-","/"))}</td><td><span class="doc-type ${item.属性==="新增"?"added":"changed"}">${esc(item.属性)}</span></td><td class="doc-description">${esc(item.描述)}</td><td>${esc(item.修改人)}</td></tr>`).join("")}</tbody></table></div><p class="doc-footnote">这里记录的是需求原型变更，不是 App Store 发布记录。</p></article>`;
}
// Escape source text before adding the supported Markdown formatting.
function markdownInline(text){return esc(text).replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>")}
function renderMarkdown(source){
  const lines=source.replace(/\r\n?/g,"\n").split("\n");
  const blocks=[];let paragraph=[],list=null;
  const flushParagraph=()=>{if(paragraph.length){blocks.push(`<p>${markdownInline(paragraph.join("\n"))}</p>`);paragraph=[]}};
  const closeList=()=>{if(list){blocks.push(`</${list}>`);list=null}};
  for(const line of lines){
    const heading=line.match(/^(#{1,6})\s+(.+)$/);
    const item=line.match(/^\s*(?:([-*])\s+|(\d+)\.\s+)(.+)$/);
    if(!line.trim()){flushParagraph();closeList();continue}
    if(heading){flushParagraph();closeList();const level=Math.min(heading[1].length,6);blocks.push(`<h${level}>${markdownInline(heading[2])}</h${level}>`);continue}
    if(item){flushParagraph();const type=item[2]?"ol":"ul";if(list!==type){closeList();blocks.push(type==="ol"?`<ol start="${Number(item[2])}">`:"<ul>");list=type}blocks.push(`<li>${markdownInline(item[3])}</li>`);continue}
    closeList();paragraph.push(line);
  }
  flushParagraph();closeList();return blocks.join("");
}
let documentRequest=0;
let storeImages=[];
let storeGroups=[];
async function readStoreImages(){
  const manifestURL=new URL("../assets/商店图/manifest.json",location.href);
  const response=await fetch(manifestURL,{cache:"no-store"});
  if(!response.ok)throw new Error(`HTTP ${response.status}`);
  const manifest=await response.json();
  return manifest.groups.map(group=>({name:group.name,files:group.files.map(file=>({name:file.name,url:new URL(file.path,manifestURL).href}))}));
}
async function loadStoreDocument(request){
  const target=$("#document-content");
  target.innerHTML=`<article class="doc-card"><div class="doc-eyebrow">APP STORE GALLERY</div><h1>商店图</h1><p class="doc-lead" role="status">正在读取图片…</p></article>`;
  try{
    const groups=await readStoreImages();
    if(request!==documentRequest||state.page!=="store")return;
    storeGroups=groups.sort((a,b)=>(a.name==="待办版"?-1:b.name==="待办版"?1:0));
    renderStoreGallery();
  }catch(error){
    if(request!==documentRequest||state.page!=="store")return;
    target.innerHTML=`<article class="doc-card"><div class="doc-eyebrow">APP STORE GALLERY</div><h1>商店图</h1><p class="doc-lead" role="alert">图片读取失败，请确认商店图目录可访问。</p><button type="button" class="secondary-button metadata-retry" data-action="reload-store">重新读取</button></article>`;
  }
}
function renderStoreGallery(){
  if(!storeGroups.some(group=>group.name===state.storeTab))state.storeTab=storeGroups[0]?.name||"";
  const group=storeGroups.find(group=>group.name===state.storeTab);
  storeImages=group?.files||[];
  const tabs=storeGroups.map((item,i)=>`<button type="button" role="tab" id="store-tab-${i}" aria-controls="store-panel" aria-selected="${item.name===state.storeTab}" class="doc-tab ${item.name===state.storeTab?"active":""}" data-store-tab="${esc(item.name)}">${esc(item.name)}<span>${item.files.length}</span></button>`).join("");
  const cards=storeImages.map((file,index)=>`<figure class="store-image ${/总览/.test(file.name)?"store-overview":""}"><button type="button" class="store-image-button" data-store-image="${index}" aria-label="放大查看${esc(file.name)}"><img src="${esc(file.url)}" alt="${esc(file.name)}" loading="lazy" decoding="async"><span class="store-zoom">放大查看 ↗</span></button><figcaption>${esc(file.name)}</figcaption></figure>`).join("");
  $("#document-content").innerHTML=`<article class="doc-card store-card"><div class="metadata-top"><div><div class="doc-eyebrow">APP STORE GALLERY</div><h1>商店图</h1></div><button type="button" class="secondary-button" data-action="reload-store">刷新图片</button></div><div class="doc-tabs" role="tablist" aria-label="商店图版本">${tabs}</div><div id="store-panel" role="tabpanel" aria-labelledby="store-tab-${storeGroups.indexOf(group)}"><p class="doc-lead">${storeImages.length} 张截图 · 点击图片可放大查看</p><div class="store-grid store-tab-grid">${cards||'<div class="doc-empty">暂无商店图</div>'}</div></div></article>`;
}
function openStoreImage(index){
  const file=storeImages[index];if(!file)return;
  $("#modal-root").innerHTML=`<div class="modal-backdrop store-preview-backdrop"><div class="store-preview" role="dialog" aria-modal="true" aria-labelledby="store-preview-title"><div class="store-preview-heading"><h2 id="store-preview-title">${esc(file.name)}</h2><div><a href="${esc(file.url)}" target="_blank" rel="noopener">查看原图 ↗</a><button type="button" class="icon-button" data-action="close-modal" aria-label="关闭图片">×</button></div></div><img src="${esc(file.url)}" alt="${esc(file.name)}"></div></div>`;
  $('[aria-label="关闭图片"]').focus();
}
function metadataTabs(){
  return `<div class="doc-tabs" role="tablist" aria-label="元数据版本">${[["primary","元数据1"],["secondary","元数据2"]].map(([id,label])=>`<button type="button" role="tab" id="metadata-tab-${id}" aria-controls="metadata-panel" aria-selected="${state.metadataTab===id}" class="doc-tab ${state.metadataTab===id?"active":""}" data-metadata-tab="${id}">${label}</button>`).join("")}</div>`;
}
async function loadMetadataDocument(request){
  const target=$("#document-content");
  const filename=state.metadataTab==="primary"?"元数据.md":"元数据2.md";
  const shell=body=>`<article class="doc-card metadata-card"><div class="metadata-top"><div><div class="doc-eyebrow">APP STORE METADATA</div><h1>产品描述</h1></div><div class="metadata-actions"><a href="../docs/商店资料/${filename}" target="_blank" rel="noopener">查看源文档 ↗</a><button type="button" class="secondary-button" data-action="reload-metadata">刷新内容</button></div></div>${metadataTabs()}<div id="metadata-panel" role="tabpanel" aria-labelledby="metadata-tab-${state.metadataTab}">${body}</div></article>`;
  target.innerHTML=shell('<p class="doc-lead" role="status">正在读取文档…</p>');
  try{
    const response=await fetch(`../docs/商店资料/${filename}`,{cache:"no-store"});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const source=await response.text();
    if(request!==documentRequest||state.page!=="metadata")return;
    if(!source.trim())throw new Error("empty");
    target.innerHTML=shell(`<div class="markdown-content">${renderMarkdown(source)}</div>`);
  }catch(error){
    if(request!==documentRequest||state.page!=="metadata")return;
    target.innerHTML=shell(`<p class="doc-lead" role="alert">文档读取失败，请确认《${filename}》可访问。</p><button type="button" class="secondary-button metadata-retry" data-action="reload-metadata">重新读取</button>`);
  }
}
function informationInline(text){
  return markdownInline(text).replace(/`([^`]+)`/g,"<code>$1</code>").replace(/\[([^\]]+)\]\(#([a-z-]+)\)/g,(match,label,id)=>RENDERERS[id]?`<button type="button" class="ia-page-link" data-go="${id}">${label}<span aria-hidden="true">↗</span></button>`:label);
}
function renderCustomerFieldsMarkdown(source){
  const lines=source.replace(/\r\n?/g,"\n").split("\n");
  const blocks=[];let prose=[];
  const flush=()=>{if(prose.length){blocks.push(renderMarkdown(prose.join("\n")));prose=[]}};
  const cells=line=>line.trim().replace(/^\||\|$/g,"").split(/(?<!\\)\|/).map(cell=>cell.trim().replace(/\\\|/g,"|"));
  for(let i=0;i<lines.length;i++){
    if(lines[i].trim().startsWith("|")&&lines[i+1]?.trim().startsWith("|")&&cells(lines[i+1]).every(cell=>/^:?-{3,}:?$/.test(cell))){
      flush();const headers=cells(lines[i]);const rows=[];i+=2;
      while(i<lines.length&&lines[i].trim().startsWith("|")){rows.push(cells(lines[i]));i++}i--;
      blocks.push(`<div class="fields-table-wrap"><table class="fields-table"><thead><tr>${headers.map(header=>`<th>${informationInline(header)}</th>`).join("")}</tr></thead><tbody>${rows.map(row=>`<tr>${headers.map((_,index)=>`<td>${informationInline(row[index]||"")}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
    }else prose.push(lines[i]);
  }
  flush();return blocks.join("");
}
async function loadCustomerFieldsDocument(request){
  const target=$("#document-content");
  const shell=body=>`<article class="doc-card information-card"><div class="metadata-top"><div class="doc-eyebrow">CUSTOMER FIELD REQUIREMENTS</div><div class="metadata-actions"><a href="../docs/产品需求/客户字段需求.md" target="_blank" rel="noopener">查看源文档 ↗</a><button type="button" class="secondary-button" data-action="reload-structure">刷新内容</button></div></div><div class="markdown-content customer-fields-content">${body}</div></article>`;
  target.innerHTML=shell('<h1>联系人字段需求</h1><p role="status">正在读取文档…</p>');
  try{
    const response=await fetch("../docs/产品需求/客户字段需求.md",{cache:"no-store"});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const source=await response.text();
    if(request!==documentRequest||state.page!=="structure")return;
    if(!source.trim())throw new Error("empty");
    target.innerHTML=shell(renderCustomerFieldsMarkdown(source));
  }catch(error){
    if(request!==documentRequest||state.page!=="structure")return;
    target.innerHTML=shell('<h1>联系人字段需求</h1><p role="alert">文档读取失败，请确认《客户字段需求.md》可访问。</p>');
  }
}
function parseDocumentTable(source,required){
  const lines=source.split(/\r?\n/).filter(line=>line.trim().startsWith("|"));
  const cells=line=>line.trim().replace(/^\||\|$/g,"").split(/(?<!\\)\|/).map(cell=>cell.trim().replace(/\\\|/g,"|"));
  const headerIndex=lines.findIndex(line=>{const values=cells(line);return required.every(field=>values.includes(field))});
  if(headerIndex<0)throw new Error("missing table headers");
  const headers=cells(lines[headerIndex]);
  return lines.slice(headerIndex+1).filter(line=>!cells(line).every(cell=>/^:?-{3,}:?$/.test(cell))).map(line=>{
    const values=cells(line);if(values.length!==headers.length)throw new Error("invalid table row");
    return Object.fromEntries(headers.map((header,index)=>[header,values[index]]));
  });
}
async function loadMarkdownPage(path,title,request){
  const target=$("#document-content");target.innerHTML=`<article class="doc-card"><h1>${title}</h1><p class="doc-lead" role="status">正在读取文档…</p></article>`;
  try{const response=await fetch(path,{cache:"no-store"});if(!response.ok)throw new Error(`HTTP ${response.status}`);const source=await response.text();if(request!==documentRequest||state.page!=="checklist")return;target.innerHTML=`<article class="doc-card"><div class="doc-eyebrow">PRODUCT CHECKLIST</div><div class="metadata-top"><h1>${title}</h1><button type="button" class="secondary-button" data-action="reload-document">刷新内容</button></div><div class="markdown-content">${renderMarkdown(source)}</div></article>`}
  catch(error){if(request!==documentRequest||state.page!=="checklist")return;target.innerHTML=`<article class="doc-card"><h1>${title}</h1><p role="alert">无法读取功能清单文档。</p></article>`}
}
async function loadTableDocument(page,request){
  const title=page==="requirements"?"需求列表":"更新日志";
  const target=$("#document-content");
  target.innerHTML=`<article class="doc-card"><h1>${title}</h1><p class="doc-lead" role="status">正在读取文档…</p></article>`;
  try{
    const response=await fetch(page==="requirements"?"../docs/产品需求/需求列表.md":"../docs/更新日志.md",{cache:"no-store"});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const source=await response.text();
    const required=page==="requirements"?["序号","模块标识","需求名称","需求描述"]:["日期","属性","描述","修改人"];
    const rows=parseDocumentTable(source,required);
    if(request!==documentRequest||state.page!==page)return;
    if(page==="requirements")requirementsRows=rows;else changelogRows=rows;
    target.innerHTML=page==="requirements"?renderRequirementsDocument():renderChangelogDocument();
  }catch(error){
    if(request!==documentRequest||state.page!==page)return;
    target.innerHTML=`<article class="doc-card"><h1>${title}</h1><p class="doc-lead" role="alert">无法读取《${title}.md》，请检查文件与表格字段。</p><button type="button" class="secondary-button metadata-retry" data-action="reload-document">重新读取</button></article>`;
  }
}
function renderDocument(){
  const request=++documentRequest;
  if(state.page==="structure"){loadCustomerFieldsDocument(request);return}
  if(state.page==="store"){loadStoreDocument(request);return}
  if(state.page==="metadata"){loadMetadataDocument(request);return}
  if(state.page==="checklist"){loadMarkdownPage("../docs/产品需求/效率拨号产品功能清单.md","功能清单",request);return}
  loadTableDocument(state.page,request);
}
const RENDERERS = {dial:renderDial,customers:renderCustomers,"customer-edit":renderCustomerEdit,prep:renderPrep,live:renderLive,review:renderReview,action:renderAction,todos:renderTodos,history:renderHistory,mine:renderMine,structure:()=>"",requirements:()=>"",checklist:()=>"",changelog:()=>"",metadata:()=>"",store:()=>""};
function renderNav(){
  const q=state.navSearch.trim().toLowerCase();
  const docGroups=[
    {title:"需求文档",ids:["requirements","checklist","changelog","structure"]},
    {title:"元数据",ids:["metadata","store"]}
  ];
  const item=(p,isDoc,view="")=>{
    const active=state.page===p.id&&(!view||state.contactsTab===view);
    return `<button type="button" class="nav-item ${isDoc?"doc-nav-item":"nav-child"} ${active?"active":""}" data-go="${p.id}" ${view?`data-contacts-view="${view}"`:""} ${active?'aria-current="page"':""}><span class="nav-num">${isDoc?"▤":"›"}</span>${p.title}</button>`;
  };
  const docNav=docGroups.map(group=>{const pages=group.ids.map(id=>PAGES.find(p=>p.id===id)).filter(p=>p&&(!q||p.title.toLowerCase().includes(q)||group.title.toLowerCase().includes(q)));return pages.length?`<div class="nav-doc-heading">${group.title}</div>${pages.map(p=>item(p,true)).join("")}`:""}).join("");
  const groups=["沟通","通讯录","待办","记录","我的"];
  const flows=groups.map(group=>{
    let pages=PAGES.filter(p=>p.group===group).map(p=>({...p,view:p.id==="customers"?"contacts":""}));
    if(group==="通讯录")pages.splice(1,0,{...PAGES.find(p=>p.id==="customers"),title:"最近沟通记录",view:"recent"});
    pages=pages.filter(p=>!q||p.title.includes(q)||group.includes(q));
    return pages.length?`<div class="nav-group nav-tab-heading">${group}</div>${pages.map(p=>item(p,false,p.view)).join("")}`:"";
  }).join("");
  $("#journey-nav").innerHTML=`<label class="nav-search"><span aria-hidden="true">⌕</span><input type="search" data-input="nav-search" placeholder="搜索页面" value="${esc(state.navSearch)}" aria-label="搜索原型页面"></label>${docNav}${flows?`<div class="nav-flow-heading">产品原型</div>${flows}`:""}${!docNav&&!flows?`<div class="nav-no-results">没有匹配页面</div>`:""}`;
}
function renderSpec(){
  const page=PAGES.find(p=>p.id===state.page);
  if(!page.modules.includes(state.specKey))state.specKey=page.modules[0];
  $("#spec-module-list").innerHTML=page.modules.map(key=>`<button type="button" class="spec-chip ${state.specKey===key?"active":""}" data-module="${key}">${esc(window.REQUIREMENTS[key]?.标题||key)}</button>`).join("");
  document.querySelectorAll("[data-module]").forEach(button=>{
    if(button.classList.contains("module-link"))button.setAttribute("aria-pressed",String(button.dataset.module===state.specKey));
  });
  const note=window.REQUIREMENTS[state.specKey]||{};
  const fields=["模块说明","数据来源","前置条件","后置结果","显示数量限制","排序规则"];
  $("#spec-detail").innerHTML=`<h3>${esc(note.标题||state.specKey)}</h3><div class="spec-key">${esc(state.specKey)} · 来源：需求说明.md</div>${fields.map(field=>`<div class="spec-row"><div class="spec-label">${field}</div><p class="spec-value">${esc(note[field]||"待确认")}</p></div>`).join("")}`;
}
function setSpecOpen(open){
  const visible=!!open&&PAGES.find(page=>page.id===state.page)?.group!=="文档";
  state.specOpen=visible;
  $(".workspace-grid").classList.toggle("spec-open",visible);
  $("#spec-panel").classList.toggle("open",visible);
  $("#spec-panel").setAttribute("aria-hidden",String(!visible));
  $("#spec-panel").inert=!visible;
  $('[data-action="toggle-spec"]').setAttribute("aria-expanded",String(visible));
}
function startCall(phone){
  if(!validDialNumber(phone)||!requireMembership())return;
  state.dialNumber=phone;
  if(state.callMode==="normal"){window.location.href=`tel:+86${phone}`;return}
  state.callMatched=customer.phones.includes(phone);
  state.callStartedAt=Date.now();state.muted=false;state.speaker=false;
  go("live");
}
function renderWorkspaceStateTabs(){
  const target=$("#workspace-state-tabs");
  if(state.page==="mine")target.innerHTML=`<div class="workspace-state-tabs" role="tablist" aria-label="预览会员状态"><span>预览状态</span><button type="button" class="${state.mineView==="nonmember"?"active":""}" data-state-tab="mineView" data-state-value="nonmember" role="tab" aria-selected="${state.mineView==="nonmember"}">非会员</button><button type="button" class="${state.mineView==="member"?"active":""}" data-state-tab="mineView" data-state-value="member" role="tab" aria-selected="${state.mineView==="member"}">会员</button></div>`;
  else if(state.page==="todos")target.innerHTML=`<div class="workspace-state-tabs" role="tablist" aria-label="预览待办状态"><span>预览状态</span><button type="button" class="${state.todosView==="empty"?"active":""}" data-state-tab="todosView" data-state-value="empty" role="tab" aria-selected="${state.todosView==="empty"}">空状态</button><button type="button" class="${state.todosView==="has"?"active":""}" data-state-tab="todosView" data-state-value="has" role="tab" aria-selected="${state.todosView==="has"}">有待办</button></div>`;
  else target.innerHTML="";
}
function render(){
  const page=PAGES.find(p=>p.id===state.page)||PAGES[0];state.page=page.id;
  const isDoc=page.group==="文档";
  $(".workspace-grid").classList.toggle("document-mode",isDoc);
  const n=PAGES.indexOf(page);
  $("#stage-kicker").textContent=`${page.group} / ${state.page==="customers"&&state.contactsTab==="recent"?"最近沟通记录":page.title}`;
  $("#stage-title").textContent=page.title;$("#stage-description").textContent=page.desc;
  $("#stage-counter").textContent=`${String(n+1).padStart(2,"0")} / ${PAGES.length}`;
  $("#prev-page").disabled=n===0;$("#next-page").disabled=n===PAGES.length-1;
  if(isDoc){renderDocument()}else{
    $("#phone-content").innerHTML=RENDERERS[page.id]();
    $("#phone-content").classList.toggle("tabbed",["dial","customers","todos","history","mine"].includes(page.id));
    $("#phone-content").scrollTop=0;
    renderSpec();
  }
  setSpecOpen(state.specOpen);
  renderWorkspaceStateTabs();
  renderNav();
}
function go(page){
  if(!RENDERERS[page])return;
  const from=state.page;
  if(from==="customer-edit"&&page!=="customer-edit")customerDraft=null;
  if(from==="live"&&page!=="live")state.callStartedAt=null;
  if(page==="live"&&from!=="dial")state.callMatched=true;
  state.page=page;
  const hash=`#${page}`;
  if(location.hash!==hash)location.hash=hash;else render();
}
function formatElapsed(){const seconds=Math.max(0,Math.floor((Date.now()-(state.callStartedAt||Date.now()))/1000));return `${String(Math.floor(seconds/60)).padStart(2,"0")}:${String(seconds%60).padStart(2,"0")}`}
function syncDial(){
  const input=$("#dial-number");if(!input)return;
  input.value=state.dialNumber;
  input.setAttribute("aria-invalid",String(!!state.dialNumber&&!validDialNumber(state.dialNumber)));
  $('[data-action="place-call"]').disabled=!validDialNumber(state.dialNumber);
}
function showToast(message){const el=$("#toast");el.textContent=message;el.classList.add("show");clearTimeout(state.toastTimer);state.toastTimer=setTimeout(()=>el.classList.remove("show"),2600)}
function openEdit(){
  if(!hasMembership())return;
  if(state.taskDone||state.taskDeleted)return;
  $("#modal-root").innerHTML=`<div class="modal-backdrop"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="edit-title"><h2 id="edit-title">编辑待办</h2><p>修改事项和截止日期，保存后更新已有待办。</p><label class="field-label" for="task-title">事项</label><textarea id="task-title" class="input-field" rows="2">${esc(state.actionTitle)}</textarea><label class="field-label" for="task-due">截止日期</label><input id="task-due" class="input-field" type="date" value="${esc(state.actionDue)}"><div class="modal-actions"><button type="button" class="secondary-button" data-action="close-modal">取消</button><button type="button" class="primary-button" data-action="save-edit">保存修改</button></div></div></div>`;
  $("#task-title").focus();
}
document.addEventListener("click",e=>{
  const metadataTab=e.target.closest("[data-metadata-tab]");if(metadataTab){state.metadataTab=metadataTab.dataset.metadataTab;renderDocument();return}
  const storeTab=e.target.closest("[data-store-tab]");if(storeTab){state.storeTab=storeTab.dataset.storeTab;renderStoreGallery();return}
  const storeImage=e.target.closest("[data-store-image]");if(storeImage){openStoreImage(Number(storeImage.dataset.storeImage));return}
  const stateTab=e.target.closest("[data-state-tab]");if(stateTab){state[stateTab.dataset.stateTab]=stateTab.dataset.stateValue;if(stateTab.dataset.stateTab==="mineView")state.memberActive=state.mineView==="member";render();return}
  const goTarget=e.target.closest("[data-go]");if(goTarget){if(goTarget.dataset.contactsView){state.contactsTab=goTarget.dataset.contactsView;state.search=""}go(goTarget.dataset.go);return}
  const openModule=e.target.closest("[data-open-module]");if(openModule){const key=openModule.dataset.openModule;state.specKey=key;go(MODULE_PAGE[key]);setSpecOpen(true);return}
  const mod=e.target.closest("[data-module]");if(mod){state.specKey=mod.dataset.module;renderSpec();setSpecOpen(true);return}
  const plan=e.target.closest("[data-subscription-plan]");if(plan){state.subscriptionPlan=plan.dataset.subscriptionPlan;render();return}
  const contactsTab=e.target.closest("[data-contacts-tab]");if(contactsTab){state.contactsTab=contactsTab.dataset.contactsTab;state.search="";render();return}
  const tab=e.target.closest("[data-tab]");if(tab){state.reviewTab=tab.dataset.tab;render();return}
  const digit=e.target.closest("[data-digit]");if(digit){if(!/^[0-9]$/.test(digit.dataset.digit))return;if(state.dialNumber.length>=11)return;state.dialNumber+=digit.dataset.digit;syncDial();return}
  const callPhone=e.target.closest("[data-call-customer-phone]");if(callPhone){startCall(customer.phones[Number(callPhone.dataset.callCustomerPhone)]);return}
  const removePhone=e.target.closest("[data-remove-phone]");if(removePhone&&customerDraft){customerDraft.phones.splice(Number(removePhone.dataset.removePhone),1);render();return}
  const action=e.target.closest("[data-action]")?.dataset.action;if(!action)return;
  if(action==="add-customer-phone"){if(customerDraft&&customerDraft.phones.length<10){customerDraft.phones.push("");render()}return}
  if(action==="cancel-customer-edit"){customerDraft=null;go("customers");return}
  if(action==="save-customer"){
    if(!customerDraft)return;
    const phones=customerDraft.phones.map(phone=>phone.trim()).filter(Boolean);
    if(phones.length>10||phones.some(phone=>!validDialNumber(phone))){showToast("电话号码须为以 1 开头的 11 位数字，最多 10 个");return}
    if(new Set(phones).size!==phones.length){showToast("电话号码不能重复");return}
    for(const key of ["company","position","focus","notes"])customer[key]=customerDraft[key].trim();
    customer.phones=phones;customerDraft=null;go("customers");showToast("联系人资料已保存");return
  }
  if(action==="subscribe-membership"){showToast("订阅服务尚未接入，价格及支付渠道待确认");return}
  if(action==="reload-structure"){renderDocument();return}
  if(action==="reload-document"){renderDocument();return}
  if(action==="reload-metadata"){renderDocument();return}
  if(action==="reload-store"){renderDocument();return}
  if(action==="dial-delete"){state.dialNumber=state.dialNumber.slice(0,-1);syncDial();return}
  if(action==="place-call"){startCall(state.dialNumber);return}
  if(action==="toggle-mute"){state.muted=!state.muted;render();return}
  if(action==="toggle-speaker"){state.speaker=!state.speaker;render();return}
  if(action==="call-hangup"){state.callStartedAt=null;go("review");return}
  if(action==="match-contact"){state.callMatched=true;state.dialNumber=customer.phones[0]||state.dialNumber;render();return}
  if(action==="toggle-spec"){setSpecOpen(!state.specOpen);return}
  if(action==="close-spec"){setSpecOpen(false);$('[data-action="toggle-spec"]').focus();return}
  if(action==="confirm-status"){if(!hasMembership())return;showToast("状态已确认，保存规则待确认");return}
  if(action==="status-unknown"){if(!hasMembership())return;showToast("状态已设为未判断");return}
  if(action==="edit-task"){openEdit();return}
  if(action==="close-modal"){$("#modal-root").innerHTML="";return}
  if(action==="save-edit"){if(!hasMembership())return;if(state.taskDone||state.taskDeleted)return;const title=$("#task-title").value.trim();const due=$("#task-due").value;if(!title){showToast("请填写事项内容");return}state.actionTitle=title;state.actionDue=due||"待确认";$("#modal-root").innerHTML="";render();showToast("待办已更新");return}
  if(action==="toggle-task"){if(!hasMembership())return;if(state.taskDone||state.taskDeleted)return;state.taskDone=true;render();showToast("已标记完成");return}
  if(action==="delete-task"){if(!hasMembership())return;if(!state.taskDone||state.taskDeleted)return;state.taskDeleted=true;render();showToast("待办已删除");return}
});
document.addEventListener("change",e=>{if(e.target.matches('[data-input="call-mode"]')){state.callMode=e.target.value==="normal"?"normal":"todo";const call=$('[data-action="place-call"]');call.setAttribute("aria-label",state.callMode==="normal"?"使用系统电话呼叫":"使用待办电话呼叫")}});
document.addEventListener("input",e=>{if(e.target.matches("[data-customer-field]")&&customerDraft)customerDraft[e.target.dataset.customerField]=e.target.value;if(e.target.matches("[data-customer-phone]")&&customerDraft){const phone=e.target.value.trim().replace(/^(?:\+86|0086)\s*/,"").replace(/[^0-9]/g,"").slice(0,11);customerDraft.phones[Number(e.target.dataset.customerPhone)]=phone;e.target.value=phone;}if(e.target.matches('[data-input="dial-number"]')){const number=e.target.value.trim().replace(/^(?:\+86|0086)\s*/,"").replace(/[^0-9]/g,"");state.dialNumber=number.slice(0,11);syncDial()}if(e.target.matches('[data-input="search"]')){state.search=e.target.value;const start=e.target.selectionStart;render();const field=document.querySelector('[data-input="search"]');field.focus();field.setSelectionRange(start,start)}if(e.target.matches('[data-input="history-search"]')){state.historySearch=e.target.value;const start=e.target.selectionStart;render();const field=document.querySelector('[data-input="history-search"]');field.focus();field.setSelectionRange(start,start)}if(e.target.matches('[data-input="nav-search"]')){state.navSearch=e.target.value;const start=e.target.selectionStart;renderNav();const field=document.querySelector('[data-input="nav-search"]');field.focus();field.setSelectionRange(start,start)}if(e.target.matches('[data-input="doc-search"]')){state.docSearch=e.target.value;const start=e.target.selectionStart;$("#document-content").innerHTML=renderRequirementsDocument();const field=document.querySelector('[data-input="doc-search"]');field.focus();field.setSelectionRange(start,start)}});
$("#prev-page").addEventListener("click",()=>{const index=PAGES.findIndex(p=>p.id===state.page);if(index>0)go(PAGES[index-1].id)});
$("#next-page").addEventListener("click",()=>{const index=PAGES.findIndex(p=>p.id===state.page);if(index<PAGES.length-1)go(PAGES[index+1].id)});
window.addEventListener("hashchange",()=>{const id=location.hash.slice(1);if(id==="source"||id==="decision"){go("review");return}if(RENDERERS[id]){state.page=id;render()}});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){$("#modal-root").innerHTML="";setSpecOpen(false)}});
if(location.hash==="#source"||location.hash==="#decision")history.replaceState(null,"","#review");
state.page=RENDERERS[location.hash.slice(1)]?location.hash.slice(1):"dial";
render();
setInterval(()=>{if(state.page==="live"&&$("#call-elapsed"))$("#call-elapsed").textContent=formatElapsed()},1000);
