const PAGES = [
  {id:"dial", group:"沟通", title:"拨号", desc:"输入号码，点击呼叫。", modules:["dialNumberInput","dialKeypad"]},
  {id:"customers", group:"通讯录", title:"通讯录", desc:"查看联系人或最近沟通记录。", modules:["contactDirectory","customerCommunicationHistory","callSearch"]},
  {id:"prep", group:"通讯录", title:"拨打前回顾", desc:"带着上次的结论和约定开始沟通。", modules:["callPrepCustomerContext"]},
  {id:"live", group:"沟通", title:"通话中看板", desc:"在通话中快速查阅客户背景与通话状态。", modules:["callStatusControls","callCustomerContext","previousCommunication","agreementsAndTodos","unmatchedCustomer"]},
  {id:"review", group:"沟通", title:"通话总结", desc:"查看重点、转录和可观察的情绪线索。", modules:["callCommunicationHighlights","callTranscript","callEmotionReview","callFollowUpStatus","callActionItemExtraction","actionItemConfirmation"]},
  {id:"action", group:"沟通", title:"待办详情", desc:"查看自动创建的待办，编辑事项和截止时间。", modules:["callActionItemExtraction","actionItemConfirmation","iosRemindersExport"]},
  {id:"todos", group:"待办", title:"有待办", desc:"查看和编辑自动创建的待办及来源依据。", modules:["actionItemConfirmation"]},
  {id:"todos-empty", group:"待办", title:"空状态", desc:"没有待办时的页面展示。", modules:["actionItemConfirmation"]},
  {id:"history", group:"记录", title:"沟通历史", desc:"按客户回看每次记录和跟进。", modules:["customerCommunicationHistory","callSearch"]},
  {id:"structure", group:"文档", title:"客户字段需求", desc:"梳理客户资料、关联记录、待办与分析字段。", modules:[]},
  {id:"requirements", group:"文档", title:"需求列表", desc:"查看当前产品规格草案中的模块需求。", modules:[]},
  {id:"changelog", group:"文档", title:"更新日志", desc:"回顾需求原型与规格的实际调整。", modules:[]},
  {id:"metadata", group:"文档", title:"元数据", desc:"查看 App Store 宣传元数据。", modules:[]},
  {id:"store", group:"文档", title:"商店图", desc:"浏览 App Store 截图。", modules:[]}
];
const SOURCE_LINES = [
  {time:"00:18", speaker:"我方", text:"这次方案，您最关注哪部分？"},
  {time:"00:42", speaker:"王先生", text:"主要看实施周期和售后支持，价格也要一起评估。"},
  {time:"02:18", speaker:"王先生", text:"能在周五前给我正式报价和实施计划吗？"},
  {time:"02:29", speaker:"我方", text:"可以，我周五前把正式报价和实施计划发给您。"}
];
const DEMO_NUMBER = "13800000000";
const state = {page:"dial", specKey:null, reviewTab:"highlights", contactsTab:"contacts", metadataTab:"primary", storeTab:"待办版", actionTitle:"周五前发送正式报价与实施计划", actionDue:"2026-10-16", taskDone:false, taskDeleted:false, search:"", historySearch:"", navSearch:"", docSearch:"", docGroup:"全部", dialNumber:"", callMatched:true, callStartedAt:null, muted:false, speaker:false, toastTimer:null};
const $ = (sel) => document.querySelector(sel);
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"})[c]);
const moduleButton = (key) => `<button type="button" class="module-link" data-module="${key}" aria-label="查看模块说明" aria-pressed="${state.specKey===key}"><span class="annotation-dot" aria-hidden="true"></span></button>`;
const card = (key,title,content,extra="") => `<section class="card ${extra}" data-module-card="${key}"><div class="card-title-row"><span class="card-title">${title}</span>${moduleButton(key)}</div>${content}</section>`;
const btn = (label,go,cls="primary-button") => `<button type="button" class="${cls}" data-go="${go}">${label}</button>`;
const pageHeader = (title,back="customers",action="") => `<div class="app-header"><div style="display:flex;align-items:center"><button class="back-button" type="button" data-go="${back}" aria-label="返回">‹</button><h2 class="small-title">${title}</h2></div>${action}</div>`;
const bottom = (content) => `<div class="bottom-bar">${content}</div>`;
const tabs = (active) => `<div class="app-footer-tabs"><button type="button" data-go="dial" class="${active==="dial"?"active":""}"><span>◉</span>沟通</button><button type="button" data-go="customers" class="${active==="customers"?"active":""}"><span>⌂</span>通讯录</button><button type="button" data-go="todos" class="${active==="todos"?"active":""}"><span>☑</span>待办</button><button type="button" data-go="history" class="${active==="history"?"active":""}"><span>≡</span>记录</button></div>`;

const validDialNumber = number => /^1\d{10}$/.test(number);
function renderDial(){
  const keys=[["1",""],["2","ABC"],["3","DEF"],["4","GHI"],["5","JKL"],["6","MNO"],["7","PQRS"],["8","TUV"],["9","WXYZ"],["*", ""],["0",""],["#",""]];
  return `<div class="app-header"><h2>沟通</h2></div><div class="app-body dial-body"><div class="dial-input-region">${moduleButton("dialNumberInput")}<div class="dial-number-box"><span class="dial-country" aria-label="中国区号">+86</span><input id="dial-number" type="tel" inputmode="numeric" autocomplete="tel-national" data-input="dial-number" aria-label="手机号码" aria-invalid="${!!state.dialNumber&&!validDialNumber(state.dialNumber)}" placeholder="输入手机号码" value="${esc(state.dialNumber)}"><button type="button" class="dial-delete" data-action="dial-delete" aria-label="删除一位号码">⌫</button></div></div><div class="dial-pad" aria-label="拨号键盘">${keys.map(([digit,letters])=>`<button type="button" class="dial-key" data-digit="${digit}" aria-label="数字 ${digit}" ${/^[0-9]$/.test(digit)?"":"disabled"}><strong>${digit}</strong><small>${letters||"&nbsp;"}</small></button>`).join("")}</div><button type="button" class="dial-call" data-action="place-call" aria-label="呼叫" ${validDialNumber(state.dialNumber)?"":"disabled"}>呼叫</button></div>${tabs("dial")}`;
}

function renderCustomers(){
  const recent=state.contactsTab==="recent";
  const query=state.search.trim();
  const visible=!query||"王先生 北辰科技 13800000000".includes(query);
  const records=[{date:"10 月 10 日 · 10:30",title:"方案评估",text:"关注实施周期、售后支持及价格，约定周五前补充报价。",page:"review"},{date:"10 月 8 日 · 15:00",title:"方案讨论",text:"认可方案方向，希望了解部署周期和支持范围。",page:"prep"}];
  const shown=records.filter(r=>!query||`王先生 北辰科技 ${r.title} ${r.text}`.includes(query));
  const content=recent?shown.map(r=>`<div class="record-date">${r.date}</div><button type="button" class="card record-card" data-go="${r.page}" style="width:100%;text-align:left"><div class="person-row"><span class="avatar mint">王</span><div class="person-info"><strong>王先生</strong><span>北辰科技 · ${r.title}</span></div><span class="chevron">›</span></div><p>${r.text}</p></button>`).join("")||`<div class="empty-state"><strong>没有匹配的沟通记录</strong>试试客户名称或沟通关键词。</div>`:visible?`<div class="section-label">联系人</div><button type="button" class="list-button" data-go="prep"><span class="avatar mint">王</span><span class="list-main"><strong>王先生</strong><small>北辰科技 · 138 0000 0000</small></span><span class="chevron">›</span></button>`:`<div class="empty-state"><strong>没有匹配的联系人</strong>试试姓名、公司或电话号码。</div>`;
  return `<div class="app-header"><h2>通讯录</h2></div><div class="tab-row contacts-tabs" role="tablist" aria-label="通讯录内容"><button type="button" id="contacts-tab" role="tab" aria-controls="contacts-panel" aria-selected="${!recent}" class="tab-button ${!recent?"active":""}" data-contacts-tab="contacts">通讯录</button><button type="button" id="recent-tab" role="tab" aria-controls="contacts-panel" aria-selected="${recent}" class="tab-button ${recent?"active":""}" data-contacts-tab="recent">最近沟通记录</button></div><div class="app-body no-footer" id="contacts-panel" role="tabpanel" aria-labelledby="${recent?"recent-tab":"contacts-tab"}"><label class="app-search"><span aria-hidden="true">⌕</span><input type="search" data-input="search" placeholder="${recent?"搜索姓名、沟通关键词":"搜索姓名、公司、电话"}" value="${esc(state.search)}" aria-label="${recent?"搜索最近沟通记录":"搜索通讯录"}"></label>${content}</div>${tabs("customers")}`;
}

function renderPrep(){
  return `${pageHeader("拨打前回顾")}<div class="app-body"><div class="overline">BEFORE THE CALL</div><h1 class="page-title">先看上次说到哪</h1><p class="page-desc">王先生 · 北辰科技</p>${card("callPrepCustomerContext","客户摘要",`<div class="person-row"><span class="avatar mint">王</span><div class="person-info"><strong>王先生</strong><span>北辰科技 · 采购负责人</span></div></div><div class="tag-row"><span class="tag">重点客户</span><span class="tag gray">方案评估中</span></div><div class="info-row"><span>核心关注</span><strong>实施周期、售后支持</strong></div><div class="info-row"><span>联系目的</span><strong>确认评估进展与报价要求</strong></div>`)}${card("callPrepCustomerContext","最近沟通摘要",`<div class="body-copy">上次客户认可方案方向，希望进一步了解部署周期、售后支持和正式报价。</div><div class="source">已保存沟通记录 · 10 月 8 日</div>`)}${card("callPrepCustomerContext","未完成约定",`<div class="task-row"><span class="check-circle"></span><div><strong>补充实施计划与支持说明</strong><small>来自上次沟通 · 待确认进度</small></div></div>`)}</div>${bottom(btn("进入通话看板 →","live"))}`;
}

function renderLive(){
  if(!state.callStartedAt)state.callStartedAt=Date.now();
  const target=state.callMatched?"王先生":state.dialNumber?`+86 ${state.dialNumber}`:"未关联号码";
  const meta=state.callMatched?"北辰科技":"号码未匹配客户";
  const board=state.callMatched?`${card("callCustomerContext","客户资料",`<div class="person-row"><span class="avatar mint">王</span><div class="person-info"><strong>王先生</strong><span>北辰科技 · 采购负责人</span></div></div><div class="tag-row"><span class="tag">重点客户</span><span class="tag gray">评估阶段</span></div>`)}${card("previousCommunication","上次沟通",`<div class="body-copy">客户认可方案方向，下一步重点讨论实施周期、售后支持和正式报价。</div><div class="source">10 月 8 日 · 用户已保存的沟通摘要</div>`)}${card("agreementsAndTodos","约定与待办",renderTaskBlock())}`:`${card("unmatchedCustomer","未关联客户",`<div class="body-copy">当前号码没有匹配到客户，暂无历史总结、约定和待办。</div><button type="button" class="ghost-button" data-action="match-contact">关联客户 →</button>`)}`;
  const icon=(paths)=>`<svg viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  const mic=icon(`<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/>${state.muted?'<path d="M3 3l18 18"/>':""}`);
  const speaker=icon(`<path d="M11 5 6 9H3v6h3l5 4z"/>${state.speaker?'<path d="M15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/>':'<path d="m16 9 5 6m0-6-5 6"/>'}`);
  const hangup=icon('<path d="M3 14c5-5 13-5 18 0l-2 4-4-2v-3a14 14 0 0 0-6 0v3l-4 2z" fill="currentColor" stroke="none"/>');
  return `<div class="call-top"><div class="call-state-row"><span class="call-active"><i></i>通话中</span>${moduleButton("callStatusControls")}</div><div class="person-row"><span class="avatar">${state.callMatched?"王":"#"}</span><div class="person-info"><strong>${esc(target)}</strong><span>${meta}</span></div><div class="call-duration"><strong id="call-elapsed" aria-live="off" aria-label="通话时长">${formatElapsed()}</strong></div></div><div class="call-controls"><button type="button" class="call-control ${state.muted?"is-on":""}" data-action="toggle-mute" aria-label="${state.muted?"取消静音":"静音"}" aria-pressed="${state.muted}" title="${state.muted?"取消静音":"静音"}">${mic}</button><button type="button" class="call-control ${state.speaker?"is-on":""}" data-action="toggle-speaker" aria-label="扬声器" aria-pressed="${state.speaker}" title="扬声器">${speaker}</button><button type="button" class="call-control end" data-action="call-hangup" aria-label="挂断" title="挂断">${hangup}</button></div></div><div class="call-board"><div class="board-grip"></div><div class="app-body">${board}</div></div>`;
}

function renderReviewContent(){
  if(state.reviewTab==="transcript")return `${card("callTranscript","通话转录",`${SOURCE_LINES.map(l=>`<div class="transcript-line"><span class="timestamp">${l.time}</span><span><span class="speaker">${l.speaker}</span>　${l.text}</span></div>`).join("")}`)}`;
  if(state.reviewTab==="emotion")return `${card("callEmotionReview","表达线索回顾",`<div class="compact-row"><strong style="font-size:12px">审慎评估</strong><span class="tag amber">模型建议</span></div><p class="body-copy">客户提出需要一起评估实施周期、售后与价格；只能判断对方案仍在评估，语气情绪证据不足。</p><div class="quote">“主要看实施周期和售后支持，价格也要一起评估。”<div class="source">王先生 · 00:42 · 通话转录</div></div><div class="warning-note">情绪强度：待确认。文本不足以判断客户的真实情绪或购买意向。</div>`)}${card("callFollowUpStatus","跟进状态建议",`<span class="tag amber">需要方案 · 待核对</span><p class="body-copy">依据：客户明确要求正式报价和实施计划。状态尚未写入客户档案。</p><div class="quote">“能在周五前给我正式报价和实施计划吗？”<div class="source">王先生 · 02:18</div></div><div class="button-row"><button class="micro-button" type="button" data-action="confirm-status">确认状态</button><button class="micro-button" type="button" data-action="status-unknown">设为未判断</button></div>`)}`;
  return `${card("callCommunicationHighlights","沟通摘要",`<div class="body-copy">客户重点关注实施周期、售后支持及价格，并希望周五前收到正式报价和实施计划。</div><div class="source">模型建议 · 请根据转录核对</div>`)}${card("callCommunicationHighlights","识别到的重点",`<div class="tag-row"><span class="tag">实施周期</span><span class="tag">售后支持</span><span class="tag blue">价格评估</span></div><div class="quote">“主要看实施周期和售后支持，价格也要一起评估。”<div class="source">王先生 · 00:42 · 通话转录</div></div>`)}`;
}

function taskControls(){
  if(state.taskDeleted)return "";
  return state.taskDone?`<button type="button" class="micro-button" data-action="delete-task">删除待办</button>`:`<button type="button" class="secondary-button" data-action="edit-task">编辑待办</button><button type="button" class="micro-button" data-action="toggle-task">标记完成</button>`;
}
function renderTaskBlock(){
  if(state.taskDeleted)return `<div class="empty-state"><strong>暂无待办</strong></div>`;
  return `<div class="compact-row"><span class="tag">自动创建</span><span class="tag ${state.taskDone?"":"amber"}">${state.taskDone?"已完成":"待完成"}</span></div><div class="body-copy" style="margin-top:12px"><strong>${esc(state.actionTitle)}</strong></div><div class="source">王先生 · 北辰科技 · 截止 ${esc(state.actionDue)}</div><div class="quote">“我周五前把正式报价和实施计划发给您。”<div class="source">我方 · 02:29 · 通话转录</div></div><div class="button-row">${taskControls()}</div><button type="button" class="ghost-button" data-go="action">查看详情 →</button>`;
}

function renderReview(){
  const task=card("actionItemConfirmation","客户待办",renderTaskBlock());
  return `${pageHeader("通话总结","live")}<div class="app-body" style="padding-bottom:7px"><div class="person-row"><span class="avatar mint">王</span><div class="person-info"><strong>王先生 · 北辰科技</strong><span>10 月 10 日 · 约 3 分钟</span></div></div><div class="tag-row"><span class="tag">通话转录</span><span class="tag amber">分析待核对</span></div></div><div class="tab-row"><button type="button" class="tab-button ${state.reviewTab==="highlights"?"active":""}" data-tab="highlights">沟通重点</button><button type="button" class="tab-button ${state.reviewTab==="transcript"?"active":""}" data-tab="transcript">通话转录</button><button type="button" class="tab-button ${state.reviewTab==="emotion"?"active":""}" data-tab="emotion">状态与线索</button></div><div class="app-body">${renderReviewContent()}${task}</div>${bottom(btn("查看全部待办 →","todos"))}`;
}

function renderAction(){
  if(state.taskDeleted)return `${pageHeader("待办详情","todos")}<div class="app-body"><div class="empty-state"><strong>该待办已删除</strong></div></div>${bottom(btn("返回待办列表","todos"))}`;
  return `${pageHeader("待办详情","todos")}<div class="app-body"><div class="overline">FROM WORDS TO ACTION</div><h1 class="page-title">约定已成为待办</h1><p class="page-desc">通话中的明确约定自动创建为待办；未完成可编辑，完成后仅可删除。</p>${card("actionItemConfirmation","待办详情",`<span class="tag">自动创建</span><div class="info-row"><span>事项</span><strong>${esc(state.actionTitle)}</strong></div><div class="info-row"><span>负责人</span><strong>我方销售</strong></div><div class="info-row"><span>截止</span><strong>${esc(state.actionDue)}</strong></div><div class="info-row"><span>状态</span><strong>${state.taskDone?"已完成":"待完成"}</strong></div><div class="info-row"><span>关联客户</span><strong>王先生 · 北辰科技</strong></div><div class="button-row">${taskControls()}</div>`)}${card("callActionItemExtraction","原文依据",`<div class="quote">“我周五前把正式报价和实施计划发给您。”<div class="source">我方 · 02:29 · 通话转录</div></div><button type="button" class="ghost-button" data-go="review">查看来源通话 →</button>`)}${card("iosRemindersExport","系统提醒事项 · 可选方案",`<div class="body-copy">App 内待办已自动创建；与 iOS 提醒事项联动尚待确认。</div><span class="tag gray">规划讨论中</span>`)}</div>${bottom(btn("查看待办列表 →","todos"))}`;
}

function renderTodos(){
  const empty=state.page==="todos-empty"||state.taskDeleted;
  const task=empty?`<div class="empty-state"><span class="empty-icon">☑</span><strong>暂无待办</strong><p>通话结束后，明确的承诺和约定会自动生成待办。</p><div style="margin-top:16px">${btn("去拨打电话","dial","secondary-button")}</div></div>`:renderTaskBlock();
  return `<div class="app-header"><h2>待办</h2><span class="tag">${empty?"0 项待办":"1 项待办"}</span></div><div class="app-body no-footer"><div class="overline">KEEP THE PROMISE</div><h1 class="page-title">把约定逐一完成</h1><p class="page-desc">通话约定自动生成待办，创建后可编辑。</p>${card("actionItemConfirmation","待办事项",task)}${!empty?card("actionItemConfirmation","任务与沟通关联",`<div class="body-copy">任务保留关联客户、来源通话和原文依据，编辑后仍可回看来源。</div><button type="button" class="ghost-button" data-go="history">查看客户沟通历史 →</button>`):""}</div>${tabs("todos")}`;
}

function renderHistory(){
  const match = !state.historySearch || "王先生 北辰科技 实施周期 售后 报价 方案".includes(state.historySearch.trim());
  return `<div class="app-header"><h2>沟通记录</h2><span class="tag">客户视图</span></div><div class="app-body no-footer"><div class="overline">COMMUNICATION MEMORY</div><h1 class="page-title">客户说过什么，随时回看</h1><p class="page-desc">按客户、时间或关键词查找已保存的记录。</p><label class="app-search"><span aria-hidden="true">⌕</span><input type="search" data-input="history-search" placeholder="搜索客户、关键词" value="${esc(state.historySearch)}" aria-label="搜索客户沟通记录"></label>${match?`<div class="record-date">10 月 10 日</div><button type="button" class="card record-card" data-go="review" style="width:100%;text-align:left"><div class="person-row"><span class="avatar mint">王</span><div class="person-info"><strong>王先生</strong><span>北辰科技 · 方案评估</span></div><span class="chevron">›</span></div><p>“主要看实施周期和售后支持，价格也要一起评估。”</p><div class="tag-row"><span class="tag">方案评估</span><span class="tag gray">报价约定</span></div></button><div class="record-date">10 月 8 日 · 已保存沟通</div><button type="button" class="card record-card" data-go="prep" style="width:100%;text-align:left"><div class="person-row"><span class="avatar mint">王</span><div class="person-info"><strong>王先生</strong><span>北辰科技 · 上次摘要</span></div><span class="chevron">›</span></div><p>客户认可方案方向，关注部署周期和支持范围。</p></button>`:`<div class="empty-state"><span class="empty-icon">⌕</span><strong>没有匹配记录</strong>试试“实施周期”“报价”或客户名称。</div>`}${card("customerCommunicationHistory","记录范围",`<div class="body-copy">仅展示已确认保存并关联到该客户的沟通记录。</div>`)}</div>${tabs("history")}`;
}

const MODULE_PAGE = {
  contactDirectory:"customers",dialNumberInput:"dial",dialKeypad:"dial",callPrepCustomerContext:"prep",callInProgressBoard:"live",callCustomerContext:"live",previousCommunication:"live",agreementsAndTodos:"live",unmatchedCustomer:"live",callStatusControls:"live",
  callTranscript:"review",callCommunicationHighlights:"review",callEmotionReview:"review",callFollowUpStatus:"review",
  callActionItemExtraction:"action",actionItemConfirmation:"action",iosRemindersExport:"action",
  customerCommunicationHistory:"history",callSearch:"history"
};
let requirementsRows=[];
let changelogRows=[];
function renderRequirementsDocument(){
  const all=requirementsRows.map(row=>[row.模块标识,{标题:row.需求名称,模块说明:row.需求描述,阶段:row.阶段,序号:row.序号}]);
  const groups=["全部",...new Set(requirementsRows.map(row=>row.阶段))];
  if(!groups.includes(state.docGroup))state.docGroup="全部";
  const q=state.docSearch.trim().toLowerCase();
  const filtered=all.filter(([key,note])=>(state.docGroup==="全部"||note.阶段===state.docGroup)&&(!q||`${key} ${note.标题} ${note.模块说明} ${note.阶段}`.toLowerCase().includes(q)));
  const rows=filtered.map(([key,note],i)=>{const page=MODULE_PAGE[key];return `<tr><td class="doc-index">${esc(note.序号)}</td><td class="doc-name"><strong>${esc(note.标题)}</strong><small>${esc(key)}</small></td><td class="doc-description">${esc(note.模块说明)}</td><td><span class="doc-category">${esc(note.阶段)}</span></td><td>${page?`<button type="button" class="doc-row-link" data-open-module="${esc(key)}">查看原型 →</button>`:`<span class="doc-muted">待设计</span>`}</td></tr>`}).join("");
  return `<article class="doc-card"><div class="doc-eyebrow">PRODUCT REQUIREMENTS</div><div class="metadata-top"><h1>需求列表</h1><button type="button" class="secondary-button" data-action="reload-document">刷新内容</button></div><p class="doc-lead">按沟通流程汇总的模块需求，内容来自《需求列表.md》；点击条目可定位对应原型。</p><div class="doc-badges"><span>产品规格草案</span><span>${all.length} 项模块需求</span><span>版本号待确认</span></div><div class="doc-toolbar"><label class="doc-search"><span aria-hidden="true">⌕</span><input type="search" data-input="doc-search" placeholder="搜索需求名称或描述" value="${esc(state.docSearch)}" aria-label="搜索需求"></label><label class="doc-filter-label">流程阶段 <select data-input="doc-group" aria-label="按流程阶段筛选">${groups.map(group=>`<option value="${esc(group)}" ${state.docGroup===group?"selected":""}>${esc(group)}</option>`).join("")}</select></label></div><div class="doc-result-count">当前显示 ${filtered.length} / ${all.length} 项</div><div class="doc-table-wrap"><table class="doc-table"><thead><tr><th>序号</th><th>需求名称</th><th>需求描述</th><th>阶段</th><th>原型入口</th></tr></thead><tbody>${rows||`<tr><td colspan="5" class="doc-empty">没有匹配的需求，请调整搜索词或阶段。</td></tr>`}</tbody></table></div><p class="doc-footnote">说明：列表是规格草案与原型映射，不代表功能已开发或通过技术验证。</p></article>`;
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
  const shell=body=>`<article class="doc-card metadata-card"><div class="metadata-top"><div><div class="doc-eyebrow">APP STORE METADATA</div><h1>元数据</h1></div><div class="metadata-actions"><a href="../docs/商店资料/${filename}" target="_blank" rel="noopener">查看源文档 ↗</a><button type="button" class="secondary-button" data-action="reload-metadata">刷新内容</button></div></div>${metadataTabs()}<div id="metadata-panel" role="tabpanel" aria-labelledby="metadata-tab-${state.metadataTab}">${body}</div></article>`;
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
  target.innerHTML=shell('<h1>客户字段需求</h1><p role="status">正在读取文档…</p>');
  try{
    const response=await fetch("../docs/产品需求/客户字段需求.md",{cache:"no-store"});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const source=await response.text();
    if(request!==documentRequest||state.page!=="structure")return;
    if(!source.trim())throw new Error("empty");
    target.innerHTML=shell(renderCustomerFieldsMarkdown(source));
  }catch(error){
    if(request!==documentRequest||state.page!=="structure")return;
    target.innerHTML=shell('<h1>客户字段需求</h1><p role="alert">文档读取失败，请确认《客户字段需求.md》可访问。</p>');
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
async function loadTableDocument(page,request){
  const title=page==="requirements"?"需求列表":"更新日志";
  const target=$("#document-content");
  target.innerHTML=`<article class="doc-card"><h1>${title}</h1><p class="doc-lead" role="status">正在读取文档…</p></article>`;
  try{
    const response=await fetch(page==="requirements"?"../docs/产品需求/需求列表.md":"../docs/更新日志.md",{cache:"no-store"});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const source=await response.text();
    const required=page==="requirements"?["序号","模块标识","需求名称","需求描述","阶段"]:["日期","属性","描述","修改人"];
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
  loadTableDocument(state.page,request);
}
const RENDERERS = {dial:renderDial,customers:renderCustomers,prep:renderPrep,live:renderLive,review:renderReview,action:renderAction,todos:renderTodos,"todos-empty":renderTodos,history:renderHistory,structure:()=>"",requirements:()=>"",changelog:()=>"",metadata:()=>"",store:()=>""};
function renderNav(){
  const q=state.navSearch.trim().toLowerCase();
  const docPages=PAGES.filter(p=>p.group==="文档"&&(!q||p.title.includes(q)));
  const item=(p,isDoc,view="")=>{
    const active=state.page===p.id&&(!view||state.contactsTab===view);
    return `<button type="button" class="nav-item ${isDoc?"doc-nav-item":"nav-child"} ${active?"active":""}" data-go="${p.id}" ${view?`data-contacts-view="${view}"`:""} ${active?'aria-current="page"':""}><span class="nav-num">${isDoc?"▤":"›"}</span>${p.title}</button>`;
  };
  const groups=["沟通","通讯录","待办","记录"];
  const flows=groups.map(group=>{
    let pages=PAGES.filter(p=>p.group===group).map(p=>({...p,view:p.id==="customers"?"contacts":""}));
    if(group==="通讯录")pages.splice(1,0,{...PAGES.find(p=>p.id==="customers"),title:"最近沟通记录",view:"recent"});
    pages=pages.filter(p=>!q||p.title.includes(q)||group.includes(q));
    return pages.length?`<div class="nav-group nav-tab-heading">${group}</div>${pages.map(p=>item(p,false,p.view)).join("")}`:"";
  }).join("");
  $("#journey-nav").innerHTML=`<label class="nav-search"><span aria-hidden="true">⌕</span><input type="search" data-input="nav-search" placeholder="搜索页面" value="${esc(state.navSearch)}" aria-label="搜索原型页面"></label>${docPages.length?`<div class="nav-doc-heading">需求文档</div>${docPages.map(p=>item(p,true)).join("")}`:""}${flows?`<div class="nav-flow-heading">产品原型</div>${flows}`:""}${!docPages.length&&!flows?`<div class="nav-no-results">没有匹配页面</div>`:""}`;
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
function render(){
  const page=PAGES.find(p=>p.id===state.page)||PAGES[0];state.page=page.id;
  const isDoc=page.group==="文档";
  $(".workspace-grid").classList.toggle("document-mode",isDoc);
  const n=PAGES.indexOf(page);
  $("#stage-kicker").textContent=`${page.group} / ${state.page==="customers"&&state.contactsTab==="recent"?"最近沟通记录":page.title}`;
  $("#stage-title").textContent=page.title;$("#stage-description").textContent=page.desc;
  $("#stage-counter").textContent=`${String(n+1).padStart(2,"0")} / 10`;
  $("#prev-page").disabled=n===0;$("#next-page").disabled=n===9;
  if(isDoc){renderDocument()}else{
    $("#phone-content").innerHTML=RENDERERS[page.id]();
    $("#phone-content").classList.toggle("tabbed",["dial","customers","todos","history"].includes(page.id));
    $("#phone-content").scrollTop=0;
    renderSpec();
  }
  renderNav();
}
function go(page){
  if(!RENDERERS[page])return;
  const from=state.page;
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
  if(state.taskDone||state.taskDeleted)return;
  $("#modal-root").innerHTML=`<div class="modal-backdrop"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="edit-title"><h2 id="edit-title">编辑待办</h2><p>修改事项和截止日期，保存后更新已有待办。</p><label class="field-label" for="task-title">事项</label><textarea id="task-title" class="input-field" rows="2">${esc(state.actionTitle)}</textarea><label class="field-label" for="task-due">截止日期</label><input id="task-due" class="input-field" type="date" value="${esc(state.actionDue)}"><div class="modal-actions"><button type="button" class="secondary-button" data-action="close-modal">取消</button><button type="button" class="primary-button" data-action="save-edit">保存修改</button></div></div></div>`;
  $("#task-title").focus();
}
document.addEventListener("click",e=>{
  const metadataTab=e.target.closest("[data-metadata-tab]");if(metadataTab){state.metadataTab=metadataTab.dataset.metadataTab;renderDocument();return}
  const storeTab=e.target.closest("[data-store-tab]");if(storeTab){state.storeTab=storeTab.dataset.storeTab;renderStoreGallery();return}
  const storeImage=e.target.closest("[data-store-image]");if(storeImage){openStoreImage(Number(storeImage.dataset.storeImage));return}
  const goTarget=e.target.closest("[data-go]");if(goTarget){if(goTarget.dataset.contactsView){state.contactsTab=goTarget.dataset.contactsView;state.search=""}go(goTarget.dataset.go);return}
  const openModule=e.target.closest("[data-open-module]");if(openModule){const key=openModule.dataset.openModule;state.specKey=key;go(MODULE_PAGE[key]);return}
  const mod=e.target.closest("[data-module]");if(mod){state.specKey=mod.dataset.module;renderSpec();if(innerWidth<=1180)$("#spec-panel").classList.add("open");return}
  const contactsTab=e.target.closest("[data-contacts-tab]");if(contactsTab){state.contactsTab=contactsTab.dataset.contactsTab;state.search="";render();return}
  const tab=e.target.closest("[data-tab]");if(tab){state.reviewTab=tab.dataset.tab;render();return}
  const digit=e.target.closest("[data-digit]");if(digit){if(!/^[0-9]$/.test(digit.dataset.digit))return;if(state.dialNumber.length>=11)return;state.dialNumber+=digit.dataset.digit;syncDial();return}
  const action=e.target.closest("[data-action]")?.dataset.action;if(!action)return;
  if(action==="reload-structure"){renderDocument();return}
  if(action==="reload-document"){renderDocument();return}
  if(action==="reload-metadata"){renderDocument();return}
  if(action==="reload-store"){renderDocument();return}
  if(action==="dial-delete"){state.dialNumber=state.dialNumber.slice(0,-1);syncDial();return}
  if(action==="place-call"){if(!validDialNumber(state.dialNumber))return;state.callMatched=state.dialNumber===DEMO_NUMBER;state.callStartedAt=Date.now();state.muted=false;state.speaker=false;go("live");return}
  if(action==="toggle-mute"){state.muted=!state.muted;render();return}
  if(action==="toggle-speaker"){state.speaker=!state.speaker;render();return}
  if(action==="call-hangup"){state.callStartedAt=null;go("review");return}
  if(action==="match-contact"){state.callMatched=true;state.dialNumber=DEMO_NUMBER;render();return}
  if(action==="toggle-spec"){$("#spec-panel").classList.toggle("open");return}
  if(action==="confirm-status"){showToast("状态已确认，保存规则待确认");return}
  if(action==="status-unknown"){showToast("状态已设为未判断");return}
  if(action==="edit-task"){openEdit();return}
  if(action==="close-modal"){$("#modal-root").innerHTML="";return}
  if(action==="save-edit"){if(state.taskDone||state.taskDeleted)return;const title=$("#task-title").value.trim();const due=$("#task-due").value;if(!title){showToast("请填写事项内容");return}state.actionTitle=title;state.actionDue=due||"待确认";$("#modal-root").innerHTML="";render();showToast("待办已更新");return}
  if(action==="toggle-task"){if(state.taskDone||state.taskDeleted)return;state.taskDone=true;render();showToast("已标记完成");return}
  if(action==="delete-task"){if(!state.taskDone||state.taskDeleted)return;state.taskDeleted=true;render();showToast("待办已删除");return}
});
document.addEventListener("change",e=>{if(e.target.matches('[data-input="doc-group"]')){state.docGroup=e.target.value;$("#document-content").innerHTML=renderRequirementsDocument()}});
document.addEventListener("input",e=>{if(e.target.matches('[data-input="dial-number"]')){const number=e.target.value.trim().replace(/^(?:\+86|0086)\s*/,"").replace(/[^0-9]/g,"");state.dialNumber=number.slice(0,11);syncDial()}if(e.target.matches('[data-input="search"]')){state.search=e.target.value;const start=e.target.selectionStart;render();const field=document.querySelector('[data-input="search"]');field.focus();field.setSelectionRange(start,start)}if(e.target.matches('[data-input="history-search"]')){state.historySearch=e.target.value;const start=e.target.selectionStart;render();const field=document.querySelector('[data-input="history-search"]');field.focus();field.setSelectionRange(start,start)}if(e.target.matches('[data-input="nav-search"]')){state.navSearch=e.target.value;const start=e.target.selectionStart;renderNav();const field=document.querySelector('[data-input="nav-search"]');field.focus();field.setSelectionRange(start,start)}if(e.target.matches('[data-input="doc-search"]')){state.docSearch=e.target.value;const start=e.target.selectionStart;$("#document-content").innerHTML=renderRequirementsDocument();const field=document.querySelector('[data-input="doc-search"]');field.focus();field.setSelectionRange(start,start)}});
$("#prev-page").addEventListener("click",()=>{const index=PAGES.findIndex(p=>p.id===state.page);if(index>0)go(PAGES[index-1].id)});
$("#next-page").addEventListener("click",()=>{const index=PAGES.findIndex(p=>p.id===state.page);if(index<PAGES.length-1)go(PAGES[index+1].id)});
window.addEventListener("hashchange",()=>{const id=location.hash.slice(1);if(id==="source"||id==="decision"){go("review");return}if(RENDERERS[id]){state.page=id;render()}});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){$("#modal-root").innerHTML="";$("#spec-panel").classList.remove("open")}});
if(location.hash==="#source"||location.hash==="#decision")history.replaceState(null,"","#review");
state.page=RENDERERS[location.hash.slice(1)]?location.hash.slice(1):"dial";
render();
setInterval(()=>{if(state.page==="live"&&$("#call-elapsed"))$("#call-elapsed").textContent=formatElapsed()},1000);
