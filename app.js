const carers = [
  { id: 1, name: 'Sofía', age: 32, pos: 0, rating: 4.9, reviews: 47, price: 24, distance: 0.8, mutual: 3, experience: '8 years', bio: 'Dog whisperer, long-walk enthusiast, and expert belly-rub provider. I work from home, so your pet gets plenty of company.', tags: ['Dogs', 'Medication', 'Overnight'] },
  { id: 2, name: 'Mateo', age: 28, pos: 1, rating: 4.8, reviews: 31, price: 20, distance: 1.4, mutual: 2, experience: '5 years', bio: 'Weekend sitter with a soft spot for senior pets. Calm home, shaded garden, and lots of patience.', tags: ['Dogs', 'Senior pets', 'Garden'] },
  { id: 3, name: 'Elena', age: 46, pos: 2, rating: 5.0, reviews: 62, price: 28, distance: 2.1, mutual: 1, experience: '12 years', bio: 'Former vet assistant offering attentive, low-stress care for cats and dogs with extra needs.', tags: ['Cats', 'First aid', 'Medication'] },
  { id: 4, name: 'Nico', age: 35, pos: 3, rating: 4.7, reviews: 19, price: 18, distance: 0.6, mutual: 0, experience: '4 years', bio: 'Active sitter near the park. Great with energetic dogs and happy to keep your routines consistent.', tags: ['Dogs', 'Running', 'Day care'] }
].sort((a,b) => (b.mutual-a.mutual) || (b.rating-a.rating));

const requests = [
  { id: 1, pet: 'Milo', breed: 'Golden retriever · 4 years', pos: 0, dates: '18–21 Oct', distance: '0.9 km', budget: '€26/day', needs: ['2 walks/day', 'Overnight', 'Oral medicine'] },
  { id: 2, pet: 'Luna', breed: 'Grey tabby · 7 years', pos: 1, dates: '23–25 Oct', distance: '1.6 km', budget: '€20/day', needs: ['Home visits', 'Quiet home'] },
  { id: 3, pet: 'Pip', breed: 'Terrier mix · 2 years', pos: 2, dates: '1–3 Nov', distance: '2.2 km', budget: '€23/day', needs: ['3 walks/day', 'No cats'] }
];

const state = { role: localStorage.pawlyRole || 'owner', view: 'discover', card: 0, accepted: JSON.parse(localStorage.pawlyAccepted || '[]'), pets: JSON.parse(localStorage.pawlyPets || '[]'), reviews: JSON.parse(localStorage.pawlyReviews || '[]') };
const app = document.querySelector('#app');
const icons = { discover:'⌁', requests:'◫', bookings:'✓', profile:'☺' };

function render(){
  app.innerHTML = `<div class="app ${state.role==='analytics'?'admin-app':''}"><header class="topbar"><div class="brand"><span class="brand-mark">🐾</span><span class="brand-name">pawly</span></div><div class="role-switch"><button class="${state.role==='owner'?'active':''}" data-role="owner">Owner</button><button class="${state.role==='carer'?'active':''}" data-role="carer">Carer</button><button class="${state.role==='analytics'?'active':''}" data-role="analytics">Analytics</button></div></header><main class="content ${state.role==='analytics'?'analytics-content':''}">${page()}</main>${nav()}</div>`;
  bind();
}

function nav(){
  if(state.role==='analytics') return `<nav class="bottomnav admin-nav"><div class="nav-label">Workspace</div><button class="nav-btn active"><span class="ico">⌁</span>Overview</button><button class="nav-btn" data-admin-jump="customers"><span class="ico">♙</span>Customers</button><button class="nav-btn" data-admin-jump="feedback"><span class="ico">☆</span>Feedback</button><div class="nav-spacer"></div><button class="nav-btn" data-role="owner"><span class="ico">←</span>Back to app</button></nav>`;
  const owner = [['discover','Discover'],['requests','My requests'],['bookings','Bookings'],['profile','Profile']];
  const carer = [['discover','Care requests'],['bookings','My bookings'],['profile','Profile']];
  return `<nav class="bottomnav">${(state.role==='owner'?owner:carer).map(([id,label])=>`<button class="nav-btn ${state.view===id?'active':''}" data-view="${id}"><span class="ico">${icons[id]}</span>${label}</button>`).join('')}</nav>`;
}

function page(){
  if(state.role==='analytics') return analyticsPage();
  if(state.view==='profile') return profilePage();
  if(state.view==='bookings') return bookingsPage();
  if(state.view==='requests' && state.role==='owner') return ownerRequests();
  return state.role==='owner' ? discoverPage() : carerRequests();
}

function analyticsPage(){
  const swipes=12847+state.card, connections=3721+state.accepted.length, reviews=1864+state.reviews.length;
  const positive=((connections/swipes)*100).toFixed(1), reviewRate=((reviews/connections)*100).toFixed(1);
  const metrics=[
    {label:'30-day retention',value:'68.4%',delta:'+4.2%',note:'vs previous period',tone:'green',points:'0,48 28,42 56,44 84,31 112,35 140,23 168,16 196,18 224,8'},
    {label:'Total swipes',value:swipes.toLocaleString(),delta:'+12.8%',note:'4,281 active owners',tone:'mint',points:'0,51 28,46 56,38 84,41 112,30 140,25 168,28 196,14 224,8'},
    {label:'Positive connections',value:connections.toLocaleString(),delta:`${positive}%`,note:'of all swipes',tone:'coral',points:'0,49 28,45 56,47 84,37 112,31 140,35 168,22 196,19 224,10'},
    {label:'Reviews left',value:reviews.toLocaleString(),delta:`${reviewRate}%`,note:'of completed matches',tone:'sun',points:'0,52 28,48 56,40 84,43 112,34 140,27 168,22 196,24 224,13'}
  ];
  return `<section class="analytics-head"><div><p class="eyebrow">Team dashboard</p><h1>Customer experience</h1><p class="subhead">A clear view of how people discover, connect, and build trust on Pawly.</p></div><div class="analytics-actions"><span class="live-dot">● Live</span><select aria-label="Reporting period"><option>Last 30 days</option><option>Last 90 days</option><option>This year</option></select><button class="filter-btn" data-export>⇩ Export</button></div></section>
  <section class="metric-grid">${metrics.map(m=>`<article class="metric-card"><div class="metric-label">${m.label}<span class="info">i</span></div><div class="metric-main"><strong>${m.value}</strong><span class="delta ${m.tone}">${m.delta}</span></div><p>${m.note}</p><svg class="spark ${m.tone}" viewBox="0 0 224 60" role="img" aria-label="${m.label} upward trend"><path d="M0 58H224"/><polyline points="${m.points}"/></svg></article>`).join('')}</section>
  <section class="analytics-grid"><article class="analytics-panel journey-panel"><div class="panel-head"><div><h2>Connection journey</h2><p>Where owners move forward—or drop away</p></div><span class="chip">Last 30 days</span></div><div class="funnel">${funnelRow('Profiles viewed',18240,100,'sage')}${funnelRow('Right swipes',7410,40.6,'mint')}${funnelRow('Requests accepted',3721,20.4,'green')}${funnelRow('Bookings completed',3018,16.5,'deep')}${funnelRow('Reviews left',reviews,10.2,'coral')}</div><div class="insight"><span>↗</span><div><b>Strongest opportunity</b><p>Only 50.2% of accepted requests become completed bookings. Follow up with owners in the first 24 hours.</p></div></div></article>
  <article class="analytics-panel"><div class="panel-head"><div><h2>Match quality</h2><p>Signals behind positive connections</p></div></div><div class="donut-wrap"><div class="donut"><div><strong>78%</strong><span>great fit</span></div></div><div class="donut-legend"><p><i class="lg mutual"></i><span>Mutual friend</span><b>89%</b></p><p><i class="lg rating"></i><span>4.8+ rating</span><b>84%</b></p><p><i class="lg nearby"></i><span>Under 2 km</span><b>76%</b></p><p><i class="lg other"></i><span>Other matches</span><b>61%</b></p></div></div></article></section>
  <section class="analytics-grid lower"><article class="analytics-panel" id="customers"><div class="panel-head"><div><h2>Retention by cohort</h2><p>Owners returning after their first booking</p></div><button class="text-btn">View details →</button></div><div class="cohort"><div class="cohort-row labels"><span>Cohort</span><span>W1</span><span>W2</span><span>W4</span><span>W8</span></div>${[['May','100','82','71','64'],['Jun','100','84','73','66'],['Jul','100','86','75','68'],['Aug','100','88','78','—']].map((r,ri)=>`<div class="cohort-row"><b>${r[0]}</b>${r.slice(1).map((x,i)=>`<span class="heat h${Math.min(4,i+ri%2)}">${x}${x==='—'?'':'%'}</span>`).join('')}</div>`).join('')}</div></article>
  <article class="analytics-panel" id="feedback"><div class="panel-head"><div><h2>Review pulse</h2><p>What customers mention most</p></div><span class="rating-big">★ 4.8</span></div><div class="sentiment"><div><b>Reliable</b><span>624 mentions</span></div><div><b>Great communication</b><span>518 mentions</span></div><div><b>Felt like family</b><span>391 mentions</span></div></div><blockquote>“Sofía kept us updated every day. Milo came home happy and relaxed.”<footer>— Recent 5-star owner review</footer></blockquote></article></section>`;
}
function funnelRow(label,value,width,tone){return `<div class="funnel-row"><div><span>${label}</span><b>${value.toLocaleString()}</b></div><div class="bar"><i class="${tone}" style="width:${width}%"></i></div></div>`}

function discoverPage(){
  const remaining = carers.slice(state.card);
  return `<p class="eyebrow">For Milo · 18–21 October</p><h1>Meet your perfect carer</h1><p class="subhead">Chosen for Milo’s needs, starting with people you trust.</p><div class="status-row"><span class="small"><b>${remaining.length}</b> thoughtful matches nearby</span><button class="filter-btn">☷ &nbsp;Filters</button></div>${remaining.length ? `<div class="card-stage">${remaining.slice(0,2).reverse().map((c,i)=>carerCard(c,i===remaining.slice(0,2).length-1)).join('')}</div><div class="actions"><button class="action" data-swipe="left" aria-label="Dismiss">✕</button><button class="action primary" data-swipe="right" aria-label="Request carer">♥</button><button class="action" data-detail="${remaining[0].id}" aria-label="View details">↗</button></div><p class="hint">Drag the card or use the buttons</p>` : `<div class="empty"><div class="big">🐾</div><h3>You’ve seen everyone nearby</h3><p>Adjust your dates or distance to find more carers.</p><button class="btn primary" data-reset>Start over</button></div>`}`;
}

function carerCard(c, top){ return `<article class="match-card ${top?'top':'next'}" data-card="${c.id}"><div class="swipe-label yes">REQUEST</div><div class="swipe-label no">PASS</div><div class="photo p${c.pos}"><span class="match-badge">👥 ${c.mutual?`${c.mutual} mutual friend${c.mutual>1?'s':''}`:'Top match'}</span><span class="availability"></span><div class="photo-title"><div><h2>${c.name}, ${c.age}</h2><p>Available for your dates</p></div><span class="rating">★ ${c.rating} <small>(${c.reviews})</small></span></div></div><div class="card-body"><div class="stats"><div class="stat"><b>€${c.price}</b><span>per day</span></div><div class="stat"><b>${c.distance} km</b><span>from you</span></div><div class="stat"><b>${c.experience}</b><span>experience</span></div></div><p class="bio">${c.bio}</p><div class="chips">${c.tags.map(x=>`<span class="chip">${x}</span>`).join('')}</div></div></article>`; }

function carerRequests(){
  const available=requests.filter(r=>!state.accepted.includes(r.id));
  return `<p class="eyebrow">Near Barcelona</p><h1>Pets who need you</h1><p class="subhead">Requests matched to your availability and care preferences.</p><div class="list">${available.map(requestCard).join('') || `<div class="empty"><div class="big">✓</div><h3>You’re all caught up</h3><p>New suitable requests will appear here.</p></div>`}</div>`;
}
function requestCard(r){return `<article class="request-card"><div class="request-top"><div class="pet-avatar p${r.pos}"></div><div class="request-info"><div style="display:flex;justify-content:space-between;gap:8px"><h3>${r.pet}</h3><span class="price">${r.budget}</span></div><p>${r.breed}<br>${r.dates} · ${r.distance} away</p></div></div><div class="request-meta">${r.needs.map(n=>`<span class="chip">${n}</span>`).join('')}</div><div class="request-actions"><button class="btn secondary" data-pass="${r.id}">Not for me</button><button class="btn primary" data-accept="${r.id}">Accept request</button></div></article>`}

function ownerRequests(){
  return `<div class="status-row"><div><p class="eyebrow">Your pets</p><h1>Care requests</h1></div><button class="icon-btn" data-addpet>＋ Add pet</button></div><p class="subhead">Keep each pet’s routine, dates, and budget in one place.</p><div class="list">${petCard('Milo','Golden retriever · 4 years',0,'18–21 Oct','€26/day','Finding a carer')}${state.pets.map((p,i)=>petCard(p.name,p.type,i%4,p.dates,`€${p.budget}/day`,'Draft')).join('')}</div>`;
}
function petCard(name,type,pos,dates,budget,status){return `<article class="request-card"><div class="request-top"><div class="pet-avatar p${pos}"></div><div class="request-info"><div style="display:flex;justify-content:space-between"><h3>${name}</h3><span class="chip">${status}</span></div><p>${type}<br>${dates} · ${budget}</p></div></div></article>`}

function bookingsPage(){
  const accepted=requests.filter(r=>state.accepted.includes(r.id));
  const base = state.role==='owner' ? [{pet:'Milo',pos:0,detail:'With Sofía · Completed 2 Oct',completed:true},{pet:'Milo',pos:0,detail:'With Mateo · 18–21 Oct',completed:false}] : accepted.map(r=>({pet:r.pet,pos:r.pos,detail:`${r.dates} · ${r.budget}`,completed:false}));
  return `<p class="eyebrow">Your schedule</p><h1>Bookings</h1><p class="subhead">Everything confirmed, all in one calm place.</p><div class="list">${base.map((b,i)=>`<article class="booking-card"><div class="booking-row"><div class="pet-avatar p${b.pos}"></div><div><h3>${b.pet}</h3><p>${b.detail}</p></div>${b.completed&&!state.reviews.length?`<button class="btn coral" data-review>Leave review</button>`:`<span class="chip">${b.completed?'Complete':'Confirmed'}</span>`}</div></article>`).join('') || `<div class="empty"><div class="big">🗓</div><h3>No bookings yet</h3><p>Accept a suitable request and it’ll appear here.</p></div>`}</div>`;
}

function profilePage(){
 return `<p class="eyebrow">Your account</p><h1>Profile & preferences</h1><div class="profile-panel" style="margin-top:18px"><div class="profile-hero"><div class="profile-avatar"></div><h2>Alex Morgan</h2><p>Barcelona · Member since 2024</p><div class="profile-badges"><span class="chip">✓ ID verified</span><span class="chip">★ 4.9</span></div></div><div class="section-title"><h2>I use Pawly as…</h2></div><div class="role-cards"><button class="role-card ${state.role==='owner'?'active':''}" data-role="owner"><span>🏡</span><b>Pet owner</b><small>Find trusted care</small></button><button class="role-card ${state.role==='carer'?'active':''}" data-role="carer"><span>🐕</span><b>Carer</b><small>Care for pets nearby</small></button></div></div>${state.reviews.length?`<div class="section-title"><h2>Your latest review</h2></div><div class="request-card"><b>${'★'.repeat(state.reviews[0].rating)}</b><p class="bio">“${state.reviews[0].text}”</p><small>For Sofía · visible on her profile</small></div>`:''}`;
}

function modal(type,data={}){
 const wrap=document.createElement('div'); wrap.className='modal-wrap';
 wrap.innerHTML = type==='pet' ? `<form class="modal"><div class="modal-head"><h2>Create a pet profile</h2><button class="close" type="button">×</button></div><div class="field"><label>Pet’s name</label><input name="name" required placeholder="e.g. Luna"></div><div class="field"><label>Type & age</label><input name="type" required placeholder="e.g. Tabby cat · 6 years"></div><div class="field"><label>Care needs</label><textarea name="needs" required placeholder="Routine, medication, temperament…"></textarea></div><div class="field"><label>Location</label><input name="location" required value="Barcelona"></div><div class="two"><div class="field"><label>Dates</label><input name="dates" required placeholder="23–25 Oct"></div><div class="field"><label>Budget / day</label><input name="budget" required type="number" placeholder="25"></div></div><button class="btn primary" style="width:100%">Save pet profile</button></form>` : `<form class="modal"><div class="modal-head"><div><p class="eyebrow">Completed booking</p><h2>How was Sofía?</h2></div><button class="close" type="button">×</button></div><p class="subhead" style="text-align:center">Your review helps other pet owners choose with confidence.</p><div class="stars">${[1,2,3,4,5].map(n=>`<button type="button" class="star ${n<=5?'on':''}" data-star="${n}">★</button>`).join('')}</div><input type="hidden" name="rating" value="5"><div class="field"><label>Write a review</label><textarea name="text" required placeholder="What made the care special?"></textarea></div><button class="btn primary" style="width:100%">Publish review</button></form>`;
 document.body.appendChild(wrap); wrap.querySelector('.close').onclick=()=>wrap.remove(); wrap.onclick=e=>{if(e.target===wrap)wrap.remove()};
 if(type==='pet') wrap.querySelector('form').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);state.pets.push(Object.fromEntries(f));save();wrap.remove();render();toast('Pet profile saved');};
 else { wrap.querySelectorAll('.star').forEach(s=>s.onclick=()=>{wrap.querySelector('[name=rating]').value=s.dataset.star;wrap.querySelectorAll('.star').forEach(x=>x.classList.toggle('on',+x.dataset.star<=+s.dataset.star));});wrap.querySelector('form').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);state.reviews.unshift({rating:+f.get('rating'),text:f.get('text')});save();wrap.remove();render();toast('Review published to Sofía’s profile');}; }
}

function bind(){
  document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{state.view=b.dataset.view;render()});
  document.querySelectorAll('[data-role]').forEach(b=>b.onclick=()=>{state.role=b.dataset.role;state.view='discover';save();render()});
  document.querySelectorAll('[data-swipe]').forEach(b=>b.onclick=()=>swipe(b.dataset.swipe));
  document.querySelector('[data-reset]')?.addEventListener('click',()=>{state.card=0;render()});
  document.querySelector('[data-addpet]')?.addEventListener('click',()=>modal('pet'));
  document.querySelector('[data-review]')?.addEventListener('click',()=>modal('review'));
  document.querySelectorAll('[data-accept]').forEach(b=>b.onclick=()=>{state.accepted.push(+b.dataset.accept);save();render();toast('Request accepted — booking confirmed');});
  document.querySelectorAll('[data-pass]').forEach(b=>b.onclick=()=>{b.closest('.request-card').style.display='none';toast('Request hidden')});
  document.querySelector('.filter-btn')?.addEventListener('click',()=>toast('Showing best ranked matches first'));
  document.querySelector('[data-export]')?.addEventListener('click',()=>toast('Report exported as CSV'));
  document.querySelectorAll('[data-admin-jump]').forEach(b=>b.onclick=()=>document.querySelector(`#${b.dataset.adminJump}`)?.scrollIntoView({behavior:'smooth'}));
  document.querySelector('[data-detail]')?.addEventListener('click',()=>toast('Profile details are already expanded'));
  dragCard();
}
function dragCard(){const c=document.querySelector('.match-card.top');if(!c)return;let start=0,x=0;c.onpointerdown=e=>{start=e.clientX;c.setPointerCapture(e.pointerId);c.classList.add('dragging')};c.onpointermove=e=>{if(!start)return;x=e.clientX-start;c.style.transform=`translateX(${x}px) rotate(${x/18}deg)`;c.querySelector(x>0?'.yes':'.no').style.opacity=Math.min(Math.abs(x)/90,1)};c.onpointerup=()=>{c.classList.remove('dragging');if(Math.abs(x)>90)swipe(x>0?'right':'left');else{c.style.transform='';c.querySelectorAll('.swipe-label').forEach(l=>l.style.opacity=0)}start=0;x=0};}
function swipe(dir){const c=document.querySelector('.match-card.top');if(!c)return;c.style.transform=`translateX(${dir==='right'?700:-700}px) rotate(${dir==='right'?25:-25}deg)`;c.style.opacity='0';if(dir==='right')toast(`Request sent to ${carers[state.card].name}`);setTimeout(()=>{state.card++;render()},300)}
function save(){localStorage.pawlyRole=state.role;localStorage.pawlyAccepted=JSON.stringify(state.accepted);localStorage.pawlyPets=JSON.stringify(state.pets);localStorage.pawlyReviews=JSON.stringify(state.reviews)}
function toast(msg){document.querySelector('.toast')?.remove();const t=document.createElement('div');t.className='toast';t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),2200)}
render();
