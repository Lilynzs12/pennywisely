/* data.js - sample data (all in RM). Month: November 2026.
   Demo "today" is 4 Nov 2026 so every figure on every page stays consistent. */
const PW = {
  user: { username: "user", password: "user12345" },
  cats: {
    Food:{c:"#fd7e14",i:"bi-cup-hot"}, Transport:{c:"#0d6efd",i:"bi-bus-front"}, Housing:{c:"#6610f2",i:"bi-house-door"},
    Shopping:{c:"#d63384",i:"bi-bag"}, Bills:{c:"#20c997",i:"bi-lightning-charge"}, Health:{c:"#dc3545",i:"bi-heart-pulse"},
    Leisure:{c:"#0dcaf0",i:"bi-controller"}, Pets:{c:"#ffc107",i:"bi-balloon-heart"}, Income:{c:"#198754",i:"bi-cash-stack"}
  },
  months: ["Jun","Jul","Aug","Sep","Oct","Nov"],
  history: { income:[4800,4800,5100,4800,5200,5300], expense:[3150,3420,3280,3610,3050,0] }, // Nov expense comes from transactions
  tx: [
    {d:"2026-11-03",n:"Monthly salary",c:"Income",t:"in",a:4800,m:"Bank transfer"},
    {d:"2026-11-02",n:"Freelance design project",c:"Income",t:"in",a:500,m:"Bank transfer"},
    {d:"2026-11-01",n:"Apartment rent",c:"Housing",t:"out",a:1100,m:"Bank transfer"},
    {d:"2026-11-01",n:"Condo maintenance fee",c:"Housing",t:"out",a:150,m:"Bank transfer"},
    {d:"2026-11-01",n:"TNB electricity bill",c:"Bills",t:"out",a:118.4,m:"FPX"},
    {d:"2026-11-02",n:"Unifi internet",c:"Bills",t:"out",a:129,m:"Card"},
    {d:"2026-11-02",n:"Mobile postpaid plan",c:"Bills",t:"out",a:68,m:"Card"},
    {d:"2026-11-01",n:"Pasar Malam groceries",c:"Food",t:"out",a:64.5,m:"Cash"},
    {d:"2026-11-02",n:"Jaya Grocer weekly shop",c:"Food",t:"out",a:182.9,m:"Card"},
    {d:"2026-11-03",n:"Lunch with colleagues",c:"Food",t:"out",a:46.8,m:"E-wallet"},
    {d:"2026-11-03",n:"Coffee beans & cafe",c:"Food",t:"out",a:38.5,m:"E-wallet"},
    {d:"2026-11-04",n:"Nasi lemak breakfast",c:"Food",t:"out",a:9.5,m:"Cash"},
    {d:"2026-11-01",n:"Touch 'n Go reload",c:"Transport",t:"out",a:100,m:"E-wallet"},
    {d:"2026-11-02",n:"Petrol RON95",c:"Transport",t:"out",a:85,m:"Card"},
    {d:"2026-11-03",n:"Grab ride to KLCC",c:"Transport",t:"out",a:27.6,m:"E-wallet"},
    {d:"2026-11-02",n:"Uniqlo winter sale",c:"Shopping",t:"out",a:219.9,m:"Card"},
    {d:"2026-11-03",n:"Online course – UX basics",c:"Shopping",t:"out",a:149,m:"Card"},
    {d:"2026-11-03",n:"Pharmacy – vitamins",c:"Health",t:"out",a:56.8,m:"Card"},
    {d:"2026-11-02",n:"Gym membership",c:"Health",t:"out",a:129,m:"Card"},
    {d:"2026-11-03",n:"Netflix subscription",c:"Leisure",t:"out",a:54,m:"Card"},
    {d:"2026-11-04",n:"Cinema – weekend movie",c:"Leisure",t:"out",a:42,m:"E-wallet"},
    {d:"2026-11-03",n:"Shopee seller payout – handmade keychains",c:"Income",t:"in",a:186.5,m:"DuitNow"},
    {d:"2026-11-04",n:"Carousell sale – used office chair",c:"Income",t:"in",a:120,m:"DuitNow"},
    {d:"2026-11-01",n:"Ikan bakar pari, sambal belacan, kangkung belacan & air tembikai at Medan Ikan Bakar",c:"Food",t:"out",a:38.9,m:"Cash"},
    {d:"2026-11-01",n:"Mamak supper with friends – maggi goreng & teh tarik",c:"Food",t:"out",a:31.5,m:"E-wallet"},
    {d:"2026-11-01",n:"Pasar tani – ikan kembung, sayur & telur",c:"Food",t:"out",a:42.3,m:"Cash"},
    {d:"2026-11-02",n:"Roti canai & teh ais",c:"Food",t:"out",a:8.6,m:"Cash"},
    {d:"2026-11-02",n:"Nasi kandar Pelita dinner – ayam & kuah campur",c:"Food",t:"out",a:24.5,m:"E-wallet"},
    {d:"2026-11-02",n:"Tealive brown sugar boba",c:"Food",t:"out",a:14.9,m:"E-wallet"},
    {d:"2026-11-03",n:"Kopitiam breakfast – kaya toast & kopi O",c:"Food",t:"out",a:11.2,m:"Cash"},
    {d:"2026-11-03",n:"ShopeeFood – ayam gepuk set with extra sambal",c:"Food",t:"out",a:27.4,m:"E-wallet"},
    {d:"2026-11-04",n:"Nasi campur lunch",c:"Food",t:"out",a:12.8,m:"Cash"},
    {d:"2026-11-04",n:"Ayam penyet Pak Mat",c:"Food",t:"out",a:18.5,m:"Cash"},
    {d:"2026-11-04",n:"Starbucks iced latte",c:"Food",t:"out",a:17.9,m:"Card"},
    {d:"2026-11-02",n:"Monthly parking bay – Subang Jaya office",c:"Transport",t:"out",a:60,m:"Card"},
    {d:"2026-11-03",n:"Toll – KESAS & LDP highway",c:"Transport",t:"out",a:12.6,m:"E-wallet"},
    {d:"2026-11-04",n:"KTM Komuter Subang Jaya to KL Sentral",c:"Transport",t:"out",a:6.3,m:"E-wallet"},
    {d:"2026-11-04",n:"Grab bike to office",c:"Transport",t:"out",a:7.5,m:"E-wallet"},
    {d:"2026-11-02",n:"Self-service dobi laundry",c:"Housing",t:"out",a:14,m:"Cash"},
    {d:"2026-11-03",n:"Petronas gas cylinder refill for cooking",c:"Housing",t:"out",a:32,m:"Cash"},
    {d:"2026-11-01",n:"Unifi Wi-Fi 6 mesh extender add-on (monthly)",c:"Bills",t:"out",a:25,m:"Card"},
    {d:"2026-11-02",n:"Thyroid consultation – Klinik Pakar Endokrin, follow-up visit",c:"Health",t:"out",a:90,m:"Card"},
    {d:"2026-11-03",n:"Thyroid blood test (TSH & Free T4) – Pathlab",c:"Health",t:"out",a:45,m:"Card"},
    {d:"2026-11-04",n:"Pharmacy – thyroid medication refill (30 days)",c:"Health",t:"out",a:38,m:"Card"},
    {d:"2026-11-01",n:"Pet shop – cat food (Whiskas 7kg) & litter",c:"Pets",t:"out",a:94.9,m:"Card"},
    {d:"2026-11-03",n:"Cat grooming & flea treatment – Paws & Claws",c:"Pets",t:"out",a:65,m:"E-wallet"},
    {d:"2026-11-04",n:"Vet – annual cat vaccination",c:"Pets",t:"out",a:80,m:"Card"},
    {d:"2026-11-01",n:"Spotify Premium",c:"Leisure",t:"out",a:15.9,m:"Card"},
    {d:"2026-11-03",n:"Futsal booking with friends (split 10 ways)",c:"Leisure",t:"out",a:35,m:"E-wallet"},
    {d:"2026-11-02",n:"Mr DIY – storage boxes & cleaning supplies",c:"Shopping",t:"out",a:36.5,m:"Card"},
    {d:"2026-11-03",n:"Shopee haul – phone case & fast charger",c:"Shopping",t:"out",a:45.9,m:"Card"}
  ],
  catHistory: { Food:[640,690,610,720,660], Transport:[260,290,250,310,240], Housing:[1250,1250,1250,1250,1250], Shopping:[380,450,520,610,310], Bills:[340,330,350,340,330], Health:[150,180,140,250,170], Leisure:[130,230,160,130,90], Pets:[110,95,140,120,105] }, // Jun–Oct; Nov is computed
  nwHistory: [23850,24920,25760,26480,27340], // net worth Jun-Oct
  wallets: [
    {id:"mbb",n:"Maybank Savings",type:"Savings",no:"•••• 4821",bal:9850,c:"#0d6efd",i:"bi-bank",sync:"Today, 09:12"},
    {id:"cimb",n:"CIMB Current",type:"Current",no:"•••• 7730",bal:5420,c:"#6610f2",i:"bi-bank2",sync:"Today, 09:12"},
    {id:"tng",n:"Touch 'n Go eWallet",type:"E-wallet",no:"•••• 0092",bal:730,c:"#198754",i:"bi-phone",sync:"Today, 08:40"},
    {id:"asb",n:"ASB Investment",type:"Investment",no:"•••• 5516",bal:12600,yield:5.2,c:"#fd7e14",i:"bi-graph-up-arrow",sync:"Yesterday"},
    {id:"visa",n:"Visa Platinum",type:"Credit card",no:"•••• 3308",bal:-1260,limit:5000,c:"#343a40",i:"bi-credit-card",sync:"Today, 07:55"}
  ],
  debts: [
    {id:"ptptn",n:"PTPTN education loan",type:"Education",i:"bi-mortarboard",orig:18000,bal:11200,rate:1,pay:220},
    {id:"car",n:"Perodua Myvi car loan",type:"Car loan",i:"bi-car-front",orig:42000,bal:24500,rate:3.2,pay:780},
    {id:"visa",n:"Visa Platinum",type:"Credit card",i:"bi-credit-card",orig:3000,bal:1260,rate:15,pay:150}
  ],
  budgets: { Food:800, Transport:350, Housing:1300, Shopping:400, Bills:400, Health:400, Leisure:250, Pets:300 },
  goals: [
    {key:"gl1",n:"Hajj for the whole family",t:60000,s:18500,due:"Dec 2029",i:"bi-moon-stars"},
    {key:"gl2",n:"MacBook Pro (latest)",t:9500,s:4200,due:"Mar 2027",i:"bi-laptop"},
    {key:"gl3",n:"Japan trip 2027",t:6500,s:3100,due:"Jun 2027",i:"bi-airplane"},
    {key:"gl4",n:"Maldives getaway",t:12000,s:3800,due:"Dec 2027",i:"bi-airplane"},
    {key:"gl5",n:"Sony camera",t:7800,s:2300,due:"Sep 2027",i:"bi-camera"},
    {key:"gl6",n:"Luxury watch (Omega)",t:14000,s:3500,due:"Dec 2028",i:"bi-gift"}
  ],
  bills: [
    {key:"b1",day:1,n:"Apartment rent",c:"Housing",a:1100,due:"Day 1",f:"Monthly",st:"Paid"},
    {key:"b2",day:1,n:"TNB electricity",c:"Bills",a:118.4,due:"Day 1",f:"Monthly",st:"Paid"},
    {key:"b3",day:2,n:"Unifi internet",c:"Bills",a:129,due:"Day 2",f:"Monthly",st:"Paid"},
    {key:"b4",day:3,n:"Netflix",c:"Leisure",a:54,due:"Day 3",f:"Monthly",st:"Paid"},
    {key:"b5",day:15,n:"Car insurance",c:"Bills",a:1480,due:"15 Nov",f:"Yearly",st:"Due soon"},
    {key:"b6",day:18,n:"Water bill (Air Selangor)",c:"Bills",a:32.5,due:"18 Nov",f:"Monthly",st:"Due soon"},
    {key:"b7",day:30,n:"Road tax renewal",c:"Transport",a:90,due:"30 Nov",f:"Yearly",st:"Upcoming"}
  ]
};
