"use client";
import { useState, useRef, useEffect } from "react";

const C = {
  bg:"#060509",surface:"#0C0B10",card:"#100F15",cardB:"#16141C",
  border:"rgba(255,255,255,0.055)",borderG:"rgba(220,160,40,0.22)",
  gold:"#DCA828",goldL:"#F5D170",goldD:"#8A6510",
  cream:"#F0E4C0",muted:"#6B657A",dim:"#353242",white:"#FFFFFF",
  green:"#2ECC8E",greenBg:"rgba(46,204,142,0.07)",greenBd:"rgba(46,204,142,0.18)",
  red:"#E86060",redBg:"rgba(232,96,96,0.07)",redBd:"rgba(232,96,96,0.18)",
  amber:"#E8A020",amberBg:"rgba(232,160,32,0.07)",amberBd:"rgba(232,160,32,0.2)",
  blue:"#7B8FF5",blueBg:"rgba(123,143,245,0.08)",blueBd:"rgba(123,143,245,0.2)",
  purple:"#B87EF0",purpleBg:"rgba(184,126,240,0.08)",purpleBd:"rgba(184,126,240,0.2)",
};

const sl={fontSize:10,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase"};

const scoreLabel=s=>s>=82?"Strong Yes":s>=68?"Lean Yes":s>=50?"Uncertain":s>=34?"Lean No":"Strong No";
const scoreColor=s=>s>=82?C.green:s>=68?C.gold:s>=50?C.amber:C.red;
const scoreBg=s=>s>=82?C.greenBg:s>=68?C.amberBg:s>=50?C.amberBg:C.redBg;
const scoreBd=s=>s>=82?C.greenBd:s>=68?C.amberBd:s>=50?C.amberBd:C.redBd;

// ── Universal questions (always asked, simplified) ─────────────────────────
const UNIVERSAL_QS=[
  {category:"Clarity",      q:"Can you say clearly, in one sentence, what a good outcome looks like?",               why:"If you cannot picture what success looks like, you are not ready to decide yet. Clarity comes before action."},
  {category:"Alignment",    q:"Does this fit with the things that matter most to you right now?",                    why:"Decisions that work against your own values drain energy even when they succeed. The best moves feel consistent with who you are."},
  {category:"Reversibility",q:"If this turns out to be wrong, how easy would it be to change course?",               why:"Easy to reverse means lower risk. Hard to reverse means it deserves more thought. Most big decisions fall somewhere in between."},
  {category:"Gut Feeling",  q:"When you stop thinking and just feel it, does this decision sit well with you?",       why:"Your gut is not magic. It is years of experience compressed. It deserves a say, even if logic leads the way."},
  {category:"Future Regret",q:"Five years from now, would you regret more taking this chance or passing it up?",     why:"This is one of the most honest filters in decision making. Regret from not trying tends to outlast regret from trying and failing."},
];

function getSpecializedQs(topic){
  const t=topic.toLowerCase();
  if(/job|offer|internship|career|work|promot|quit|resign|employ|hire|role|position/i.test(t))return[
    {category:"Skill Growth",    q:"Will this role teach you something rare and genuinely hard to learn elsewhere?",        why:"The best jobs pay you in capability, not just salary. A role that makes you more skilled is worth more long term."},
    {category:"The Team",        q:"Do the people you would work with raise your standards or lower them?",                  why:"You become like the people around you. The team matters more than the title."},
    {category:"Fair Pay",        q:"Are they paying you what the market says you are worth?",                               why:"Low pay sets a low anchor for every negotiation that follows. Know your number before you agree to theirs."},
    {category:"Culture Fit",     q:"Does their way of working match how you actually do your best work?",                   why:"A role in the wrong environment will grind you down no matter how good the job looks on paper."},
    {category:"What You Give Up",q:"What are you walking away from to take this, and is the trade honestly worth it?",     why:"Every yes closes a door somewhere else. Be honest about what you are leaving behind."},
  ];
  if(/buy|purchas|spend|invest|money|stock|crypto|propert|house|car|rent|afford|loan|debt/i.test(t))return[
    {category:"Fits the Budget", q:"Can you pay for this without putting pressure on your finances?",                       why:"The best purchase is one you can absorb comfortably. Financial stress from overcommitting cancels out the benefit."},
    {category:"Worth Over Time", q:"Will this hold its value, earn you money, or save you meaningful cost later?",          why:"Spending that pays you back over time is a different category from spending that just feels good today."},
    {category:"Real Need",       q:"Does this solve a genuine problem in your daily life, or does it mostly just feel good to think about?", why:"Buying things that solve real problems compounds well. Buying novelty typically fades fast."},
    {category:"Alternatives",   q:"Have you seriously looked at other options that could meet the same need for less?",    why:"The best purchase is rarely the first one you considered. Comparison shopping is a discipline, not an inconvenience."},
    {category:"Wait Test",       q:"Would waiting 30 days change how you feel about this?",                                why:"Most regret in buying decisions comes from timing, not the thing itself. Manufactured urgency is the enemy of good spending."},
  ];
  if(/school|degree|univers|course|study|learn|mba|grad|educat|certif|program/i.test(t))return[
    {category:"Doors It Opens",  q:"Does this credential realistically lead to opportunities you cannot access right now?", why:"A degree is a tool. The question is whether this particular tool actually opens the doors you want, in your field, at your level."},
    {category:"Faster Paths",    q:"Could you get to the same place faster through experience or self-study?",             why:"The gap between formal and informal learning is narrowing quickly. Outcomes matter more than how you got there."},
    {category:"Debt Reality",    q:"Can you handle the financial cost without debt that follows you for years?",           why:"Student debt reshapes your risk tolerance for a long time. Model what your monthly reality looks like after you graduate."},
    {category:"Right Timing",    q:"Is this the right moment in your career to step away from real-world experience?",    why:"Going back too early or too late changes what you will get from the program. Timing is part of the decision."},
    {category:"True Reason",     q:"Are you doing this because you genuinely want it, or to avoid something harder?",     why:"School can be a productive delay. It can also be an expensive one. Be honest about which this is."},
  ];
  if(/move|relocat|city|country|abroad|apartment|place|home|live|neighborhood/i.test(t))return[
    {category:"New Opportunities",q:"Does this place open up real career or life possibilities that you do not have now?", why:"Where you live shapes what you can access. The right location can accelerate everything around it."},
    {category:"Your People",     q:"How much of your support network would you be leaving behind?",                        why:"Friendships and family are infrastructure. Rebuilding your social world from scratch takes years and carries a real cost."},
    {category:"Fits Your Life",  q:"Does the pace, culture, and feel of this place actually match how you want to live?", why:"You can outperform your environment for a while, but not forever. It needs to actually fit who you are."},
    {category:"Cost of Life",    q:"Does what you earn there genuinely work with what it costs to live there?",           why:"High salary in a high cost city can leave you less financially ahead than a lower salary somewhere more affordable."},
    {category:"Easy to Undo",    q:"If it does not work out in a year or two, how hard would it be to come back?",        why:"Moves that are difficult to reverse deserve more careful thought upfront. Know your exit before you commit."},
  ];
  if(/relationship|date|marry|break|partner|friend|family|romantic|together|split/i.test(t))return[
    {category:"Shared Values",   q:"Do you genuinely want the same things in life, not just right now but long term?",    why:"What you have in common on the surface fades over time. What you share at the core is what holds things together."},
    {category:"Better Together", q:"Do you consistently show up as a better version of yourself around this person?",     why:"The people closest to you shape who you become. A relationship that brings out your best is one of the most valuable things in life."},
    {category:"Equal Effort",    q:"Is the care and effort honestly going both ways, consistently?",                      why:"Uneven relationships do not tend to stabilize on their own. They tend to drift further apart over time."},
    {category:"Clear Head",      q:"Are you making this decision from a calm and grounded place, not from pressure or fear?", why:"Big relationship decisions made from anxiety or scarcity rarely age well. Check where the feeling is coming from."},
    {category:"Long View",       q:"Can you picture this genuinely working well for you in five to ten years, not just today?", why:"Short term comfort and long term fit are often two different things. Looking further ahead changes the picture."},
  ];
  if(/start|business|launch|found|entrepren|startup|product|company/i.test(t))return[
    {category:"Real Demand",     q:"Do you have real evidence that people want this and would actually pay for it?",       why:"Most failed startups solved problems that existed only in the founder's head. Validate before you build."},
    {category:"Right Person",    q:"Are your specific skills and background a genuine fit for what this venture needs?",   why:"Passion gets you started. The real question is whether you are actually the right person to solve this particular problem."},
    {category:"Enough Runway",   q:"Do you have enough money and time to reach a real proof of concept?",                 why:"Most ventures fail by running out of resources, not ideas. Do the math honestly before you start."},
    {category:"Hard to Copy",    q:"Is there something about your approach that a bigger, better-funded competitor could not easily replicate?", why:"Without a genuine edge, you are just a prototype waiting to be outspent by someone larger."},
    {category:"Full Commitment", q:"Are you ready for the workload, financial pressure, and emotional weight this will actually require?", why:"Building something real is harder and lonelier than it looks from the outside. Underestimating that is one of the most common early mistakes."},
  ];
  return[
    {category:"The Evidence",    q:"What do you actually know, not just hope, that supports doing this now?",             why:"Good decisions are built on what you know, not what you wish were true. Be honest about the difference."},
    {category:"Worst Case",      q:"What is the worst realistic outcome, and can you genuinely handle it?",               why:"If you can survive the downside, you can afford to take the risk. Start there."},
    {category:"Who It Helps",    q:"Who does this decision benefit most, and are you comfortable with that answer?",      why:"The best decisions create value for you and the people around you. Purely self-serving choices tend to backfire eventually."},
    {category:"What You Need",   q:"What important piece of information are you still missing before you can decide well?", why:"Knowing what you do not know is just as important as knowing what you do. Name the gap before you move."},
    {category:"Outside View",    q:"What would a smart, honest friend say if you explained your reasoning to them?",      why:"We all have blind spots. Imagining an honest outside perspective surfaces assumptions that are invisible from the inside."},
  ];
}

const LABELS=["Very negative","Somewhat negative","Neutral","Somewhat positive","Very positive"];
const WEIGHTS=[5,25,50,78,100];

function getQuestionCount(){return 10;}

function GoldBar({pct,h=5,color=null}){
  return(
    <div style={{height:h,borderRadius:99,background:"rgba(255,255,255,0.07)",overflow:"hidden"}}>
      <div style={{height:"100%",width:`${pct}%`,background:color||`linear-gradient(90deg,${C.goldD},${C.gold})`,borderRadius:99,transition:"width .6s ease"}}/>
    </div>
  );
}

function Chip({children,color=C.gold,bg="rgba(220,168,40,0.1)",bd=C.borderG,style={}}){
  return <span style={{...sl,color,background:bg,border:`1px solid ${bd}`,borderRadius:99,padding:"3px 12px",display:"inline-block",...style}}>{children}</span>;
}

function Card({children,style={}}){
  return <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,...style}}>{children}</div>;
}

function Nav({screen,onNav}){
  const tabs=[{id:"enter",icon:"◈",label:"Decide"},{id:"advisor",icon:"✦",label:"Advisor"},{id:"history",icon:"◎",label:"Analytics"}];
  return(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"15px 28px",borderBottom:`1px solid ${C.border}`,background:C.surface,position:"sticky",top:0,zIndex:100}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:32,height:32,borderRadius:9,background:`linear-gradient(135deg,#1A1508,#2E2010)`,border:`1px solid ${C.borderG}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>👑</div>
        <div>
          <span style={{fontSize:15,fontWeight:700,color:C.cream,letterSpacing:"-0.01em"}}>Maharba</span>
          <span style={{fontSize:11,color:C.dim,marginLeft:8}}>Decision Intelligence</span>
        </div>
      </div>
      <div style={{display:"flex",gap:3,background:"rgba(255,255,255,0.03)",border:`1px solid ${C.border}`,borderRadius:13,padding:4}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>onNav(t.id)}
            style={{display:"flex",alignItems:"center",gap:6,padding:"7px 16px",borderRadius:9,border:"none",background:screen===t.id?C.cardB:"transparent",color:screen===t.id?C.cream:C.muted,fontSize:13,fontWeight:screen===t.id?600:400,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>
            <span style={{fontSize:10,color:screen===t.id?C.gold:C.dim}}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function GlowOrb({top,left,right,color,size=300}){
  return <div style={{position:"absolute",top,left,right,width:size,height:size/2,borderRadius:"50%",background:`radial-gradient(ellipse,${color} 0%,transparent 70%)`,pointerEvents:"none"}}/>;
}

// ── Enter Screen ───────────────────────────────────────────────────────────
function EnterScreen({history,onStart}){
  const [val,setVal]=useState("");
  const [focused,setFocused]=useState(false);
  const examples=["Should I take this job offer?","Should I invest in a new car?","Should I move cities?","Should I start this business?"];
  const avg=history.length?Math.round(history.reduce((a,d)=>a+d.score,0)/history.length):null;
  const goodCount=history.filter(d=>d.score>=68).length;

  return(
    <div style={{minHeight:"calc(100vh - 65px)",background:C.bg}}>
      <div style={{position:"relative",overflow:"hidden",padding:"72px 24px 60px",textAlign:"center",borderBottom:`1px solid rgba(220,168,40,0.08)`}}>
        <GlowOrb top={-100} left="50%" color="rgba(220,168,40,0.06)" size={700}/>
        <GlowOrb top={0} left="10%" color="rgba(184,126,240,0.04)" size={300}/>
        <GlowOrb top={0} right="10%" color="rgba(184,126,240,0.04)" size={300}/>

        <div style={{display:"inline-flex",alignItems:"center",gap:8,borderRadius:99,border:"1px solid rgba(220,168,40,0.22)",background:"rgba(220,168,40,0.06)",padding:"6px 18px 6px 10px",marginBottom:32,position:"relative"}}>
          <div style={{width:20,height:20,borderRadius:"50%",background:`linear-gradient(135deg,${C.goldD},${C.gold})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10}}>👑</div>
          <span style={{fontSize:11,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:C.gold}}>Personal Strategy System</span>
        </div>

        <h1 style={{fontSize:52,fontWeight:800,color:C.cream,letterSpacing:"-0.04em",lineHeight:1.06,margin:"0 0 20px",maxWidth:660,marginLeft:"auto",marginRight:"auto",position:"relative"}}>
          Make decisions<br/>
          <span style={{background:`linear-gradient(90deg,${C.goldD} 0%,${C.goldL} 50%,${C.gold} 100%)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>you will be proud of.</span>
        </h1>

        <p style={{fontSize:16,color:C.muted,lineHeight:1.75,maxWidth:440,margin:"0 auto 44px",position:"relative"}}>
          Answer a set of sharp, tailored questions and get a scored breakdown with a clear recommendation built around your exact situation.
        </p>

        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:32,marginBottom:44,position:"relative"}}>
          {[["10 to 15","Questions per analysis"],["Under 3 min","Average time to complete"],["5 domains","Career, Finance, Life, Health, Relationships"]].map(([v,l])=>(
            <div key={l} style={{textAlign:"center"}}>
              <div style={{fontSize:15,fontWeight:700,color:C.cream,marginBottom:3}}>{v}</div>
              <div style={{fontSize:11,color:C.dim}}>{l}</div>
            </div>
          ))}
        </div>

        <div style={{maxWidth:560,margin:"0 auto",borderRadius:20,border:`1px solid ${focused?"rgba(220,168,40,0.45)":C.borderG}`,background:"rgba(255,255,255,0.03)",transition:"border-color .2s, box-shadow .2s",boxShadow:focused?"0 0 48px rgba(220,168,40,0.07)":"none",position:"relative"}}>
          <textarea value={val} onChange={e=>setVal(e.target.value)}
            onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
            placeholder="e.g. Should I accept the senior engineer offer at the Series B startup?"
            rows={2} style={{width:"100%",background:"transparent",border:"none",outline:"none",resize:"none",fontSize:15,color:C.white,padding:"20px 22px 10px",fontFamily:"inherit",lineHeight:1.65,boxSizing:"border-box"}}/>
          <div style={{padding:"10px 14px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:12,color:C.dim}}>{val.trim().length>4?"Personalized questions ready":"Be specific for a sharper analysis"}</span>
            <button onClick={()=>val.trim().length>4&&onStart(val.trim())}
              style={{background:val.trim().length>4?`linear-gradient(135deg,${C.goldD},${C.gold})`:"rgba(255,255,255,0.06)",border:"none",borderRadius:11,padding:"10px 24px",fontSize:13,fontWeight:700,color:val.trim().length>4?"#000":C.dim,cursor:val.trim().length>4?"pointer":"not-allowed",transition:"all .2s",fontFamily:"inherit",boxShadow:val.trim().length>4?"0 4px 22px rgba(220,168,40,0.22)":"none"}}>
              Analyze
            </button>
          </div>
        </div>

        <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginTop:16,position:"relative"}}>
          {examples.map(ex=>(
            <button key={ex} onClick={()=>setVal(ex)}
              style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:99,padding:"7px 15px",fontSize:12,color:C.muted,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(220,168,40,0.3)";e.currentTarget.style.color=C.cream;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted;}}>
              {ex}
            </button>
          ))}
        </div>
      </div>

      <div style={{maxWidth:860,margin:"0 auto",padding:"40px 24px 64px"}}>
        {history.length>0&&(
          <>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:12,marginBottom:28}}>
              {[
                {label:"Decisions analyzed",value:history.length,sub:"total",icon:"◈"},
                {label:"Average quality score",value:avg,sub:"out of 100",icon:"◎"},
                {label:"Good decisions made",value:goodCount,sub:"of "+history.length,icon:"✦"},
              ].map(item=>(
                <div key={item.label} style={{borderRadius:20,border:`1px solid ${C.border}`,background:`linear-gradient(145deg,${C.card},rgba(220,168,40,0.025))`,padding:"22px 20px",position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",top:14,right:16,fontSize:18,color:"rgba(220,168,40,0.1)",fontWeight:700}}>{item.icon}</div>
                  <p style={{fontSize:34,fontWeight:800,color:scoreColor(Number(item.value)||avg),margin:"0 0 6px",letterSpacing:"-0.02em"}}>
                    {item.value}
                    <span style={{fontSize:13,fontWeight:400,color:C.muted,marginLeft:4}}>{item.sub}</span>
                  </p>
                  <p style={{...sl,color:C.dim,margin:0,fontSize:9}}>{item.label}</p>
                </div>
              ))}
            </div>

            <Card style={{padding:22,marginBottom:28}}>
              <p style={{...sl,color:C.muted,marginBottom:16}}>Recent decisions</p>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {history.slice(0,3).map(d=>(
                  <div key={d.id} style={{display:"flex",alignItems:"center",gap:14,padding:"13px 16px",borderRadius:14,background:"rgba(255,255,255,0.02)",border:`1px solid ${C.border}`}}>
                    <div style={{width:46,height:46,borderRadius:13,background:scoreBg(d.score),border:`1px solid ${scoreBd(d.score)}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,flexDirection:"column"}}>
                      <span style={{fontSize:15,fontWeight:800,color:scoreColor(d.score),lineHeight:1}}>{d.score}</span>
                      <span style={{fontSize:9,color:scoreColor(d.score),opacity:.65}}>/100</span>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontSize:13,color:C.cream,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontWeight:500}}>{d.topic}</p>
                      <p style={{fontSize:11,color:C.muted,margin:"3px 0 0"}}>{d.label} · {d.date}</p>
                    </div>
                    <div style={{borderRadius:8,background:scoreBg(d.score),border:`1px solid ${scoreBd(d.score)}`,padding:"4px 12px",flexShrink:0}}>
                      <span style={{fontSize:11,fontWeight:600,color:scoreColor(d.score)}}>{d.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}

        <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:12}}>
          {[
            {icon:"🎯",title:"Built around your decision",desc:"Questions shift entirely based on what you are deciding. No generic checklists."},
            {icon:"📊",title:"Scored across every dimension",desc:"Each factor is rated and weighted. You see exactly where you stand and where the risk is."},
            {icon:"✨",title:"Genie is here when it is hard",desc:"Talk through the tough ones with a companion designed to help you think, not just agree with you."},
          ].map(f=>(
            <div key={f.title} style={{borderRadius:18,border:`1px solid ${C.border}`,background:C.card,padding:"22px 18px"}}>
              <div style={{fontSize:22,marginBottom:12}}>{f.icon}</div>
              <p style={{fontSize:13,fontWeight:700,color:C.cream,margin:"0 0 7px"}}>{f.title}</p>
              <p style={{fontSize:12,color:C.muted,lineHeight:1.65,margin:0}}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Questions Screen ───────────────────────────────────────────────────────
function QuestionsScreen({topic,onDone}){
  const totalTarget=useRef(getQuestionCount());
  const specCount=totalTarget.current-5;
  const specQs=getSpecializedQs(topic).slice(0,specCount);
  const allQs=[...UNIVERSAL_QS,...specQs];
  const [step,setStep]=useState(0);
  const [answers,setAnswers]=useState({});
  const q=allQs[step];
  const picked=answers[step]??null;
  const isSpec=step>=5;

  function next(){
    if(picked===null)return;
    if(step<allQs.length-1)setStep(s=>s+1);
    else onDone(answers,allQs);
  }

  return(
    <div style={{minHeight:"calc(100vh - 65px)",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{width:"100%",maxWidth:560}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
          <span style={{...sl,color:C.muted}}>Question {step+1} of {allQs.length}</span>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {isSpec&&<Chip color={C.blue} bg={C.blueBg} bd={C.blueBd}>Personalized</Chip>}
            <Chip color={isSpec?C.blue:C.gold} bg={isSpec?C.blueBg:C.amberBg} bd={isSpec?C.blueBd:C.amberBd}>{q.category}</Chip>
          </div>
        </div>
        <GoldBar pct={(step/allQs.length)*100} h={3}/>

        <div style={{margin:"16px 0",display:"inline-flex",alignItems:"center",gap:7,background:"rgba(255,255,255,0.03)",border:`1px solid ${C.border}`,borderRadius:10,padding:"6px 14px",maxWidth:"100%"}}>
          <span style={{fontSize:11,color:C.dim}}>Analyzing</span>
          <span style={{fontSize:12,color:C.cream,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:360}}>{topic}</span>
        </div>

        <Card style={{padding:26,marginBottom:12}}>
          <h2 style={{margin:"0 0 20px",fontSize:19,fontWeight:600,color:C.white,lineHeight:1.5}}>{q.q}</h2>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {LABELS.map((label,i)=>{
              const sel=picked===i;
              return(
                <button key={i} onClick={()=>setAnswers(a=>({...a,[step]:i}))}
                  style={{display:"flex",alignItems:"center",gap:13,padding:"13px 16px",borderRadius:13,border:sel?`1px solid ${C.gold}`:`1px solid ${C.border}`,background:sel?"rgba(220,168,40,0.07)":"rgba(255,255,255,0.02)",cursor:"pointer",transition:"all .15s",textAlign:"left",fontFamily:"inherit"}}>
                  <div style={{width:24,height:24,borderRadius:"50%",border:sel?`2px solid ${C.gold}`:`1px solid ${C.border}`,background:sel?C.gold:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}>
                    {sel&&<span style={{fontSize:10,color:"#000",fontWeight:800}}>✓</span>}
                  </div>
                  <span style={{fontSize:13,color:sel?C.cream:"#999",fontWeight:sel?500:400,flex:1}}>{label}</span>
                  <span style={{fontSize:11,color:C.dim}}>{i+1} / 5</span>
                </button>
              );
            })}
          </div>
        </Card>

        <Card style={{padding:"13px 18px",marginBottom:16,borderColor:"rgba(255,255,255,0.04)"}}>
          <p style={{...sl,color:C.dim,marginBottom:5}}>Why this matters</p>
          <p style={{fontSize:13,color:C.muted,lineHeight:1.7,margin:0}}>{q.why}</p>
        </Card>

        <div style={{display:"flex",gap:10}}>
          {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{flex:1,borderRadius:13,border:`1px solid ${C.border}`,background:"transparent",padding:"13px 0",fontSize:14,fontWeight:600,color:C.muted,cursor:"pointer",fontFamily:"inherit"}}>Back</button>}
          <button onClick={next} disabled={picked===null}
            style={{flex:3,borderRadius:13,border:"none",background:picked!==null?`linear-gradient(135deg,${C.goldD},${C.gold})`:"rgba(255,255,255,0.05)",padding:"13px 0",fontSize:14,fontWeight:700,color:picked!==null?"#000":C.dim,cursor:picked!==null?"pointer":"not-allowed",fontFamily:"inherit",transition:"all .2s"}}>
            {step===allQs.length-1?"Get my analysis":"Next question"}
          </button>
        </div>

        <div style={{display:"flex",gap:3,justifyContent:"center",marginTop:18,flexWrap:"wrap"}}>
          {allQs.map((_,i)=>(
            <div key={i} style={{width:i<step?14:5,height:5,borderRadius:99,background:i<step?C.gold:i===step?"rgba(220,168,40,0.4)":"rgba(255,255,255,0.07)",transition:"all .3s"}}/>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Result Screen ──────────────────────────────────────────────────────────
function ResultScreen({topic,answers,questions,onRestart,onNav}){
  const totalQs=questions.length;
  const rawScores=questions.map((_,i)=>WEIGHTS[answers[i]??2]);
  const avg=Math.round(rawScores.reduce((a,b)=>a+b,0)/totalQs);
  const col=scoreColor(avg);const bg=scoreBg(avg);const bd=scoreBd(avg);
  const label=scoreLabel(avg);
  const strengths=questions.filter((_,i)=>rawScores[i]>=78).map(q=>q.category);
  const risks=questions.filter((_,i)=>rawScores[i]<=25).map(q=>q.category);

  const rec=avg>=82?"The evidence is clearly in favor of moving forward. This decision scores well across multiple dimensions. Proceed with confidence and set clear milestones to measure your progress."
    :avg>=68?"This looks like a solid move overall. A few areas deserve attention before you fully commit, but the foundation is strong."
    :avg>=50?"This decision is genuinely mixed. Work on the weaker areas before committing, or wait for the conditions to improve."
    :avg>=34?"The analysis suggests pausing. Several important factors are working against this right now. Revisit when the circumstances shift."
    :"This decision scores poorly across most dimensions. It is worth stepping back, gathering more information, and reconsidering your approach.";

  return(
    <div style={{maxWidth:660,margin:"0 auto",padding:"28px 24px 48px"}}>
      <Card style={{padding:28,marginBottom:14,textAlign:"center",border:`1px solid ${bd}`}}>
        <Chip style={{marginBottom:16}}>Analysis complete</Chip>
        <div style={{margin:"0 auto 16px",width:100,height:100,borderRadius:"50%",border:`3px solid ${col}`,background:bg,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
          <span style={{fontSize:30,fontWeight:700,color:col,lineHeight:1}}>{avg}</span>
          <span style={{fontSize:10,color:col,opacity:.7}}>out of 100</span>
        </div>
        <h2 style={{fontSize:24,fontWeight:700,color:C.white,margin:"0 0 8px"}}>{label}</h2>
        <p style={{fontSize:13,color:C.muted,margin:0,padding:"0 20px"}}>{topic}</p>
      </Card>

      <Card style={{padding:22,marginBottom:12,border:`1px solid ${bd}`,background:bg.replace("0.07","0.03")}}>
        <p style={{...sl,color:col,marginBottom:10}}>Recommendation</p>
        <p style={{fontSize:14,color:C.cream,lineHeight:1.8,margin:0}}>{rec}</p>
      </Card>

      {(strengths.length>0||risks.length>0)&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
          {strengths.length>0&&(
            <Card style={{padding:18,border:`1px solid ${C.greenBd}`,background:C.greenBg}}>
              <p style={{...sl,color:C.green,marginBottom:10}}>Working for you</p>
              {strengths.map(s=><p key={s} style={{fontSize:13,color:"#d1fae5",margin:"5px 0"}}>✓ {s}</p>)}
            </Card>
          )}
          {risks.length>0&&(
            <Card style={{padding:18,border:`1px solid ${C.redBd}`,background:C.redBg}}>
              <p style={{...sl,color:C.red,marginBottom:10}}>Watch carefully</p>
              {risks.map(r=><p key={r} style={{fontSize:13,color:"#fecaca",margin:"5px 0"}}>⚠ {r}</p>)}
            </Card>
          )}
        </div>
      )}

      <Card style={{padding:22,marginBottom:14}}>
        <p style={{...sl,color:C.muted,marginBottom:16}}>Score breakdown across {questions.length} dimensions</p>
        <div style={{display:"flex",flexDirection:"column",gap:13}}>
          {questions.map((q,i)=>(
            <div key={i}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <div style={{display:"flex",gap:7,alignItems:"center"}}>
                  <span style={{fontSize:13,color:"#bbb"}}>{q.category}</span>
                  {i>=5&&<Chip color={C.blue} bg={C.blueBg} bd={C.blueBd} style={{fontSize:9,padding:"2px 8px"}}>tailored</Chip>}
                </div>
                <span style={{fontSize:13,fontWeight:600,color:scoreColor(rawScores[i])}}>{rawScores[i]}</span>
              </div>
              <GoldBar pct={rawScores[i]} h={5} color={`linear-gradient(90deg,${scoreColor(rawScores[i])}55,${scoreColor(rawScores[i])})`}/>
            </div>
          ))}
        </div>
      </Card>

      <div style={{display:"flex",gap:10}}>
        <button onClick={onRestart} style={{flex:1,borderRadius:13,border:`1px solid ${C.border}`,background:"transparent",padding:"13px 0",fontSize:14,fontWeight:600,color:C.muted,cursor:"pointer",fontFamily:"inherit"}}>New decision</button>
        <button onClick={()=>onNav("advisor")} style={{flex:2,borderRadius:13,border:"none",background:`linear-gradient(135deg,${C.goldD},${C.gold})`,padding:"13px 0",fontSize:14,fontWeight:700,color:"#000",cursor:"pointer",fontFamily:"inherit"}}>Talk it through with Genie</button>
      </div>
    </div>
  );
}

// ── Trend Chart ────────────────────────────────────────────────────────────
function TrendChart({history}){
  const data=[...history].reverse().slice(-15);
  if(data.length<2)return <div style={{textAlign:"center",padding:"40px 0",color:C.muted,fontSize:13}}>Complete more decisions to see your trend.</div>;
  const W=540,H=130,pad=28;
  const pts=data.map((d,i)=>({x:pad+(i/(data.length-1))*(W-pad*2),y:H-pad-((d.score)/100)*(H-pad*2),score:d.score,topic:d.topic,date:d.date}));
  const path=pts.map((p,i)=>i===0?`M${p.x},${p.y}`:`L${p.x},${p.y}`).join(" ");
  const area=`M${pts[0].x},${H-pad} `+pts.map(p=>`L${p.x},${p.y}`).join(" ")+` L${pts[pts.length-1].x},${H-pad} Z`;
  const avg=Math.round(data.reduce((a,d)=>a+d.score,0)/data.length);
  const trend=data[data.length-1].score-data[0].score;
  const [hov,setHov]=useState(null);

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:16}}>
        <div style={{display:"flex",gap:16,alignItems:"baseline"}}>
          <div>
            <span style={{fontSize:30,fontWeight:700,color:scoreColor(avg)}}>{avg}</span>
            <span style={{fontSize:13,color:C.muted,marginLeft:6}}>average score</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:5,borderRadius:8,padding:"4px 10px",background:trend>=0?C.greenBg:C.redBg,border:`1px solid ${trend>=0?C.greenBd:C.redBd}`}}>
            <span style={{fontSize:13,fontWeight:700,color:trend>=0?C.green:C.red}}>{trend>=0?"↑":"↓"} {Math.abs(trend)} pts</span>
          </div>
        </div>
        <div style={{display:"flex",gap:12}}>
          {[["Good",C.green],["Lean",C.gold],["Mixed",C.amber],["Poor",C.red]].map(([l,c])=>(
            <div key={l} style={{display:"flex",alignItems:"center",gap:5}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:c}}/>
              <span style={{fontSize:11,color:C.muted}}>{l}</span>
            </div>
          ))}
        </div>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{overflow:"visible"}}>
        <defs>
          <linearGradient id="aG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.gold} stopOpacity="0.15"/>
            <stop offset="100%" stopColor={C.gold} stopOpacity="0"/>
          </linearGradient>
        </defs>
        {[25,50,75].map(v=>{const y=H-pad-(v/100)*(H-pad*2);return(
          <g key={v}>
            <line x1={pad} y1={y} x2={W-pad} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
            <text x={pad-6} y={y+4} fill={C.dim} fontSize="9" textAnchor="end">{v}</text>
          </g>
        );})}
        <path d={area} fill="url(#aG)"/>
        <path d={path} fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        {pts.map((p,i)=>(
          <g key={i} onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)} style={{cursor:"pointer"}}>
            <circle cx={p.x} cy={p.y} r={hov===i?7:4} fill={scoreColor(p.score)} stroke={C.bg} strokeWidth="2"/>
          </g>
        ))}
        {hov!==null&&(()=>{
          const p=pts[hov];const bw=150,bh=50;
          const bx=Math.min(Math.max(p.x-bw/2,4),W-bw-4);const by=p.y-bh-12;
          return <g>
            <rect x={bx} y={by} width={bw} height={bh} rx="8" fill={C.cardB} stroke={C.borderG} strokeWidth="1"/>
            <text x={bx+10} y={by+17} fill={C.cream} fontSize="11" fontWeight="600">{scoreLabel(p.score)} · {p.score}/100</text>
            <foreignObject x={bx+8} y={by+22} width={bw-16} height={26}>
              <div xmlns="http://www.w3.org/1999/xhtml" style={{fontSize:10,color:C.muted,lineHeight:1.4,overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{p.topic}</div>
            </foreignObject>
          </g>;
        })()}
      </svg>
      <div style={{display:"flex",justifyContent:"space-between",padding:`0 ${pad}px`,marginTop:4}}>
        {data.map((d,i)=><span key={i} style={{fontSize:9,color:C.dim}}>{d.date}</span>)}
      </div>
    </div>
  );
}

// ── History Screen ─────────────────────────────────────────────────────────
function HistoryScreen({history,onClear}){
  const [confirming,setConfirming]=useState(false);
  const data=history.slice(0,15);
  const avg=data.length?Math.round(data.reduce((a,d)=>a+d.score,0)/data.length):0;
  const best=data.length?Math.max(...data.map(d=>d.score)):0;
  const good=data.filter(d=>d.score>=68).length;

  return(
    <div style={{maxWidth:700,margin:"0 auto",padding:"28px 24px 48px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <div>
          <Chip style={{marginBottom:10}}>Analytics</Chip>
          <h2 style={{fontSize:22,fontWeight:700,color:C.cream,margin:0,letterSpacing:"-0.02em"}}>Your Decision Intelligence</h2>
        </div>
        {!confirming
          ?<button onClick={()=>setConfirming(true)} style={{background:C.redBg,border:`1px solid ${C.redBd}`,borderRadius:10,padding:"8px 14px",fontSize:13,color:C.red,cursor:"pointer",fontFamily:"inherit"}}>Clear history</button>
          :<div style={{display:"flex",gap:8,alignItems:"center"}}>
            <span style={{fontSize:13,color:C.muted}}>Are you sure?</span>
            <button onClick={()=>{onClear();setConfirming(false);}} style={{background:C.redBg,border:`1px solid ${C.redBd}`,borderRadius:10,padding:"8px 14px",fontSize:13,fontWeight:700,color:C.red,cursor:"pointer",fontFamily:"inherit"}}>Clear all</button>
            <button onClick={()=>setConfirming(false)} style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:10,padding:"8px 14px",fontSize:13,color:C.muted,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
          </div>
        }
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
        {[["Total",data.length,"decisions"],["Average",avg,"out of 100"],["Best",best,"out of 100"],["Good calls",good,`of ${data.length}`]].map(([l,v,sub])=>(
          <Card key={l} style={{padding:"16px 12px",textAlign:"center"}}>
            <p style={{fontSize:24,fontWeight:700,color:scoreColor(Number(v)||avg),margin:"0 0 4px"}}>{v}</p>
            <p style={{...sl,color:C.dim,margin:0,fontSize:9}}>{l}</p>
            <p style={{fontSize:11,color:C.dim,margin:"2px 0 0"}}>{sub}</p>
          </Card>
        ))}
      </div>

      <Card style={{padding:22,marginBottom:16}}>
        <p style={{...sl,color:C.muted,marginBottom:16}}>Decision quality over time</p>
        <TrendChart history={data}/>
      </Card>

      <Card style={{padding:22,marginBottom:16}}>
        <p style={{...sl,color:C.muted,marginBottom:16}}>Score distribution</p>
        {[
          ["Strong Yes (82 to 100)",data.filter(d=>d.score>=82).length,C.green],
          ["Lean Yes (68 to 81)",data.filter(d=>d.score>=68&&d.score<82).length,C.gold],
          ["Uncertain (50 to 67)",data.filter(d=>d.score>=50&&d.score<68).length,C.amber],
          ["Lean No (34 to 49)",data.filter(d=>d.score>=34&&d.score<50).length,C.red],
          ["Strong No (0 to 33)",data.filter(d=>d.score<34).length,C.red],
        ].map(([l,count,col])=>(
          <div key={l} style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
            <span style={{fontSize:12,color:C.muted,width:175,flexShrink:0}}>{l}</span>
            <div style={{flex:1}}><GoldBar pct={data.length?(count/data.length)*100:0} h={5} color={`linear-gradient(90deg,${col}55,${col})`}/></div>
            <span style={{fontSize:13,fontWeight:600,color:col,width:24,textAlign:"right"}}>{count}</span>
          </div>
        ))}
      </Card>

      <Card style={{padding:22}}>
        <p style={{...sl,color:C.muted,marginBottom:14}}>Last {data.length} decisions</p>
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {data.map((d,i)=>(
            <div key={d.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderRadius:13,background:"rgba(255,255,255,0.02)",border:`1px solid ${C.border}`}}>
              <span style={{...sl,color:C.dim,width:18,flexShrink:0,fontSize:9}}>#{i+1}</span>
              <div style={{width:42,height:42,borderRadius:11,background:scoreBg(d.score),border:`1px solid ${scoreBd(d.score)}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{fontSize:13,fontWeight:700,color:scoreColor(d.score)}}>{d.score}</span>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:13,color:C.cream,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.topic}</p>
                <p style={{fontSize:11,color:C.muted,margin:"2px 0 0"}}>{d.label} · {d.date}</p>
              </div>
              <div style={{borderRadius:8,background:scoreBg(d.score),border:`1px solid ${scoreBd(d.score)}`,padding:"3px 10px",flexShrink:0}}>
                <span style={{fontSize:11,fontWeight:600,color:scoreColor(d.score)}}>{d.label}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Advisor Screen ─────────────────────────────────────────────────────────
const ADVISOR_SECTIONS=[
  {icon:"🧠",title:"The Clarity Rule",color:C.blue,bg:C.blueBg,bd:C.blueBd,
    insight:"Before making any major decision, write it down in one sentence and describe what a successful outcome looks like. If you cannot do this clearly, you are not ready to decide yet.",
    principles:["Define success before you start, not after","Separate the decision from the emotion around it","A confused mind always defaults to no. Clarity is the prerequisite for action"],
    stat:{label:"of decisions made without a clear success outcome lead to regret",value:"67%",source:"Harvard Decision Lab"}},
  {icon:"⚖️",title:"The 10 10 10 Framework",color:C.gold,bg:C.amberBg,bd:C.amberBd,
    insight:"When facing a tough decision, ask: how will I feel about this in 10 minutes, 10 months, and 10 years? Most decisions that feel urgent in the short term look obvious from the long term view.",
    principles:["Short term discomfort often signals long term gain","What feels safe today can be the riskiest choice in 10 years","Most urgent decisions are not actually urgent. Urgency is a pressure tactic, including the one your own brain plays on you"],
    stat:{label:"of poor decisions are driven by short term emotional urgency",value:"78%",source:"Kahneman and Tversky Research"}},
  {icon:"🔍",title:"The Reversibility Test",color:C.purple,bg:C.purpleBg,bd:C.purpleBd,
    insight:"Jeff Bezos separates all decisions into Type 1, which are irreversible and consequential, and Type 2, which are reversible and adjustable. Most people apply the same level of caution to both. That is a mistake in both directions.",
    principles:["Type 2 decisions: act fast, iterate, and learn. Slowness here is waste","Type 1 decisions: slow down, gather data, and seek outside perspective","Most decisions are more reversible than they feel in the moment"],
    stat:{label:"of major life decisions are actually reversible. Most people do not act like it",value:"82%",source:"MIT Behavioral Economics Study"}},
  {icon:"💬",title:"The Outside Perspective",color:C.green,bg:C.greenBg,bd:C.greenBd,
    insight:"Before finalizing any important decision, imagine the most rational, caring, and honest mentor you know sitting across from you. What would they say? What would they warn you about?",
    principles:["We give better advice to others than to ourselves. Use this deliberately","Explain your reasoning out loud as if talking to a skeptic","If you would be embarrassed sharing the real reason, revisit your thinking"],
    stat:{label:"improvement in decision quality when people explain their reasoning out loud",value:"31%",source:"University of Chicago Behavioral Lab"}},
  {icon:"📊",title:"Process Over Outcome",color:C.amber,bg:C.amberBg,bd:C.amberBd,
    insight:"A good decision can lead to a bad outcome. A bad decision can lead to a good outcome. These are not the same thing. Judge your decisions by the information and reasoning available at the time, not by what happened afterward.",
    principles:["Judging past decisions purely by outcomes leads to poor future decisions","Ask yourself: given what I knew then, was this the right process?","Build systems for better decisions rather than simply hoping for better luck"],
    stat:{label:"of people evaluate past decisions based purely on outcome rather than the quality of reasoning behind them",value:"91%",source:"Annie Duke, Thinking in Bets"}},
  {icon:"🌊",title:"Protect Your Decision Energy",color:C.muted,bg:"rgba(107,101,122,0.07)",bd:"rgba(107,101,122,0.2)",
    insight:"Decision quality drops sharply as the day goes on. Obama wore the same two suits. Zuckerberg wears the same shirt. They are not lazy. They are protecting cognitive bandwidth for the things that actually matter.",
    principles:["Make your hardest decisions in the morning when willpower is at its peak","Eliminate trivial daily decisions through routines and systems","Never make a major decision when hungry, exhausted, or emotionally activated"],
    stat:{label:"drop in decision quality from morning to end of day without deliberate management",value:"35%",source:"Journal of Personality and Social Psychology"}},
];

const COMPANION_PROMPTS=[
  "I am facing a really hard choice and I do not know where to start.",
  "I feel pressured into a decision I am not sure about.",
  "How do I know if fear is driving my decision?",
  "I made a bad decision. How do I move forward?",
  "I have two good options and cannot choose between them.",
];
const GENIE_GRADIENT="linear-gradient(135deg,#7C3AED,#C084FC,#DCA828)";

function AdvisorScreen(){
  const [chat,setChat]=useState([{role:"ai",text:"Hey, I am Genie, your personal decision companion. I am not here to tell you what to do. I am here to help you think more clearly, challenge your assumptions, and find your own answer. What is on your mind? ✨"}]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const bottomRef=useRef(null);
  const [tab,setTab]=useState("companion");
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[chat]);

  async function sendMessage(text){
    if(!text.trim()||loading)return;
    const userMsg={role:"user",text};
    setChat(c=>[...c,userMsg]);setInput("");setLoading(true);
    try{
      const resp=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
        
          messages:[...chat,userMsg].map(m=>({role:m.role==="ai"?"assistant":"user",content:m.text}))})});
      const data=await resp.json();
      const reply=data.text||"I am here. Tell me more.";
      setChat(c=>[...c,{role:"ai",text:reply}]);
    }catch{setChat(c=>[...c,{role:"ai",text:"Something went wrong on my end. Please try again."}]);}
    setLoading(false);
  }

  return(
    <div style={{maxWidth:860,margin:"0 auto",padding:"28px 24px 48px"}}>
      <div style={{textAlign:"center",marginBottom:28}}>
        <Chip color={C.purple} bg={C.purpleBg} bd={C.purpleBd} style={{marginBottom:14}}>Decision Advisor</Chip>
        <h2 style={{fontSize:26,fontWeight:700,color:C.cream,margin:"0 0 8px",letterSpacing:"-0.02em"}}>Think better. Decide better.</h2>
        <p style={{fontSize:14,color:C.muted,lineHeight:1.65}}>Real frameworks used by the world's best decision makers, and a companion to talk through the hard ones.</p>
      </div>

      <div style={{display:"flex",gap:4,background:"rgba(255,255,255,0.03)",border:`1px solid ${C.border}`,borderRadius:13,padding:4,marginBottom:24,width:"fit-content"}}>
        {[["companion","◈ Companion"],["principles","✦ Principles"]].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)}
            style={{padding:"8px 20px",borderRadius:10,border:"none",background:tab===id?C.cardB:"transparent",color:tab===id?C.cream:C.muted,fontSize:13,fontWeight:tab===id?600:400,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>
            {label}
          </button>
        ))}
      </div>

      {tab==="companion"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:16}}>
          <div style={{borderRadius:20,overflow:"hidden",border:"1px solid rgba(192,132,252,0.22)",display:"flex",flexDirection:"column",height:560,position:"relative"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:160,background:"linear-gradient(180deg,rgba(124,58,237,0.1) 0%,transparent 100%)",pointerEvents:"none",zIndex:0}}/>
            <div style={{padding:"16px 20px",borderBottom:"1px solid rgba(192,132,252,0.13)",background:"rgba(124,58,237,0.07)",position:"relative",zIndex:1,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:36,height:36,borderRadius:"50%",background:GENIE_GRADIENT,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,boxShadow:"0 0 14px rgba(192,132,252,0.35)"}}>✨</div>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:7}}>
                    <span style={{fontSize:14,fontWeight:700,color:C.cream}}>Genie</span>
                    <div style={{width:7,height:7,borderRadius:"50%",background:C.green,boxShadow:`0 0 8px ${C.green}`}}/>
                    <span style={{fontSize:11,color:C.green,fontWeight:600}}>online</span>
                  </div>
                  <span style={{fontSize:11,color:C.muted}}>Your personal decision companion</span>
                </div>
              </div>
              <div style={{borderRadius:99,padding:"3px 12px",background:"rgba(192,132,252,0.1)",border:"1px solid rgba(192,132,252,0.2)"}}>
                <span style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.purple}}>Powered by Claude</span>
              </div>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"20px 18px",display:"flex",flexDirection:"column",gap:14,background:C.card,position:"relative",zIndex:1}}>
              {chat.map((m,i)=>(
                <div key={i} style={{display:"flex",gap:10,justifyContent:m.role==="user"?"flex-end":"flex-start",alignItems:"flex-end"}}>
                  {m.role==="ai"&&<div style={{width:32,height:32,borderRadius:"50%",background:GENIE_GRADIENT,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0,boxShadow:"0 0 10px rgba(192,132,252,0.3)"}}>✨</div>}
                  <div style={{maxWidth:"76%",padding:"12px 16px",borderRadius:m.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",background:m.role==="user"?GENIE_GRADIENT:"rgba(255,255,255,0.05)",border:m.role==="user"?"none":"1px solid rgba(192,132,252,0.11)",fontSize:13,color:m.role==="user"?"#fff":C.cream,lineHeight:1.7,boxShadow:m.role==="user"?"0 4px 18px rgba(124,58,237,0.22)":"none"}}>
                    {m.text}
                  </div>
                  {m.role==="user"&&<div style={{width:28,height:28,borderRadius:"50%",background:"rgba(255,255,255,0.07)",border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,flexShrink:0,color:C.muted}}>you</div>}
                </div>
              ))}
              {loading&&(
                <div style={{display:"flex",gap:10,alignItems:"flex-end"}}>
                  <div style={{width:32,height:32,borderRadius:"50%",background:GENIE_GRADIENT,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>✨</div>
                  <div style={{padding:"14px 18px",borderRadius:"18px 18px 18px 4px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(192,132,252,0.11)"}}>
                    <div style={{display:"flex",gap:5,alignItems:"center"}}>
                      {[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:C.purple,animation:`pulse${i} 1.2s ease-in-out infinite`,opacity:.7}}/>)}
                      <span style={{fontSize:11,color:C.muted,marginLeft:4}}>Genie is thinking</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef}/>
            </div>
            <div style={{padding:"12px 14px",borderTop:"1px solid rgba(192,132,252,0.1)",background:"rgba(124,58,237,0.04)",display:"flex",gap:8,position:"relative",zIndex:1}}>
              <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&sendMessage(input)}
                placeholder="Ask Genie anything about your decision"
                style={{flex:1,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(192,132,252,0.18)",borderRadius:13,padding:"11px 16px",fontSize:13,color:C.cream,outline:"none",fontFamily:"inherit"}}/>
              <button onClick={()=>sendMessage(input)} disabled={!input.trim()||loading}
                style={{borderRadius:13,border:"none",background:input.trim()&&!loading?GENIE_GRADIENT:"rgba(255,255,255,0.05)",padding:"11px 18px",fontSize:15,color:input.trim()&&!loading?"#fff":C.dim,cursor:input.trim()&&!loading?"pointer":"not-allowed",boxShadow:input.trim()&&!loading?"0 4px 14px rgba(124,58,237,0.3)":"none",transition:"all .2s"}}>✦</button>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div style={{borderRadius:18,padding:18,background:"linear-gradient(135deg,rgba(124,58,237,0.13),rgba(192,132,252,0.06))",border:"1px solid rgba(192,132,252,0.2)"}}>
              <div style={{fontSize:26,marginBottom:8}}>✨</div>
              <p style={{fontSize:14,fontWeight:600,color:C.cream,margin:"0 0 6px"}}>Meet Genie</p>
              <p style={{fontSize:12,color:C.muted,lineHeight:1.7,margin:0}}>A calm, honest decision companion. Not here to validate you. Here to help you think clearly and find your own best answer.</p>
            </div>
            <p style={{...sl,color:C.dim,margin:"4px 0 2px"}}>Start with a prompt</p>
            {COMPANION_PROMPTS.map((p,i)=>(
              <button key={i} onClick={()=>sendMessage(p)}
                style={{textAlign:"left",padding:"11px 14px",borderRadius:12,border:`1px solid ${C.border}`,background:"rgba(255,255,255,0.02)",fontSize:12,color:C.muted,cursor:"pointer",fontFamily:"inherit",lineHeight:1.55,transition:"all .15s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(192,132,252,0.28)";e.currentTarget.style.color=C.cream;e.currentTarget.style.background="rgba(192,132,252,0.04)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted;e.currentTarget.style.background="rgba(255,255,255,0.02)";}}>
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {tab==="principles"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          {ADVISOR_SECTIONS.map((s,i)=>(
            <Card key={i} style={{padding:22,border:`1px solid ${s.bd}`,background:s.bg.replace("0.07","0.04")}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                <div style={{width:38,height:38,borderRadius:10,background:s.bg,border:`1px solid ${s.bd}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>{s.icon}</div>
                <span style={{fontSize:14,fontWeight:600,color:s.color}}>{s.title}</span>
              </div>
              <p style={{fontSize:13,color:C.cream,lineHeight:1.75,marginBottom:14}}>{s.insight}</p>
              <div style={{marginBottom:14}}>
                {s.principles.map((p,j)=>(
                  <div key={j} style={{display:"flex",gap:8,marginBottom:7}}>
                    <span style={{color:s.color,fontSize:10,marginTop:2,flexShrink:0}}>◆</span>
                    <span style={{fontSize:12,color:C.muted,lineHeight:1.6}}>{p}</span>
                  </div>
                ))}
              </div>
              <div style={{borderRadius:10,background:"rgba(0,0,0,0.18)",border:`1px solid ${C.border}`,padding:"10px 14px"}}>
                <span style={{fontSize:20,fontWeight:700,color:s.color}}>{s.stat.value} </span>
                <span style={{fontSize:11,color:C.muted}}>{s.stat.label}</span>
                <div style={{...sl,color:C.dim,marginTop:4,fontSize:9}}>Source: {s.stat.source}</div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────
export default function App(){
  const [screen,setScreen]=useState("enter");
  const [topic,setTopic]=useState("");
  const [answers,setAnswers]=useState({});
  const [questions,setQuestions]=useState([]);
  const [history,setHistory]=useState(()=>{
    try{const s=localStorage.getItem("maharba_history");return s?JSON.parse(s):[];}catch{return [];}
  });

  function handleDone(a,q){
    const scores=q.map((_,i)=>WEIGHTS[a[i]??2]);
    const avg=Math.round(scores.reduce((x,y)=>x+y,0)/scores.length);
    const entry={id:Date.now(),topic,score:avg,label:scoreLabel(avg),date:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",timeZone:"UTC"})};
    setHistory(h=>{const u=[entry,...h].slice(0,15);try{localStorage.setItem("maharba_history",JSON.stringify(u));}catch{}return u;});
    setAnswers(a);setQuestions(q);setScreen("result");
  }

  function clearHistory(){
    try{localStorage.removeItem("maharba_history");}catch{}setHistory([]);
  }

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.white,fontFamily:"system-ui,-apple-system,sans-serif"}}>
      <style>{`@keyframes pulse0{0%,100%{opacity:.6}50%{opacity:1}}@keyframes pulse1{0%,100%{opacity:.4}50%{opacity:.9}}@keyframes pulse2{0%,100%{opacity:.3}50%{opacity:.8}}*{box-sizing:border-box}`}</style>
      {screen!=="questions"&&<Nav screen={screen} onNav={s=>setScreen(s)}/>}
      {screen==="enter"     &&<EnterScreen history={history} onStart={t=>{setTopic(t);setScreen("questions");}}/>}
      {screen==="questions" &&<QuestionsScreen topic={topic} onDone={handleDone}/>}
      {screen==="result"    &&<ResultScreen topic={topic} answers={answers} questions={questions} onRestart={()=>{setTopic("");setAnswers({});setScreen("enter");}} onNav={setScreen}/>}
      {screen==="advisor"   &&<AdvisorScreen/>}
      {screen==="history"   &&<HistoryScreen history={history} onClear={clearHistory}/>}
    </div>
  );
}