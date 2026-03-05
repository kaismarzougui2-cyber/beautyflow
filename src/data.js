export const APPTS_INIT = [
  { id:1, client:"Léa Martin",    avatar:"LM", service:"Brushing Star",       time:"09:00", duration:30,  price:25,  status:"confirmed", phone:"06 12 34 56 78" },
  { id:2, client:"Sophie Blanc",  avatar:"SB", service:"Coloration complète", time:"10:00", duration:120, price:85,  status:"confirmed", phone:"06 98 76 54 32" },
  { id:3, client:"Emma Rousseau", avatar:"ER", service:"Pose Gel Express",    time:"13:30", duration:45,  price:35,  status:"pending",   phone:"07 11 22 33 44" },
  { id:4, client:"Julie Moreau",  avatar:"JM", service:"Mèches & Balayage",   time:"14:30", duration:150, price:110, status:"confirmed", phone:"06 55 44 33 22" },
  { id:5, client:"Alice Dumont",  avatar:"AD", service:"Brushing Star",       time:"17:00", duration:30,  price:25,  status:"done",      phone:"06 00 11 22 33" },
];

export const CLIENTS_INIT = [
  { id:"c1", name:"Léa Martin",    avatar:"LM", visits:12, spent:340,  lastVisit:"15 Jan", noShow:0, phone:"06 12 34 56 78", fav:"Brushing Star" },
  { id:"c2", name:"Sophie Blanc",  avatar:"SB", visits:8,  spent:680,  lastVisit:"20 Jan", noShow:0, phone:"06 98 76 54 32", fav:"Coloration" },
  { id:"c3", name:"Emma Rousseau", avatar:"ER", visits:3,  spent:95,   lastVisit:"10 Jan", noShow:1, phone:"07 11 22 33 44", fav:"Pose Gel" },
  { id:"c4", name:"Julie Moreau",  avatar:"JM", visits:15, spent:1650, lastVisit:"22 Jan", noShow:0, phone:"06 55 44 33 22", fav:"Mèches" },
  { id:"c5", name:"Alice Dumont",  avatar:"AD", visits:6,  spent:150,  lastVisit:"25 Jan", noShow:2, phone:"06 00 11 22 33", fav:"Brushing" },
  { id:"c6", name:"Clara Petit",   avatar:"CP", visits:20, spent:2100, lastVisit:"26 Jan", noShow:0, phone:"06 77 88 99 00", fav:"Balayage" },
];

export const SVCS_INIT = [
  { id:"s1", name:"Brushing Star",       cat:"Coiffure", dur:30,  price:25,  deposit:false, bookings:48, icon:"💇‍♀️", active:true },
  { id:"s2", name:"Coloration complète", cat:"Coiffure", dur:120, price:85,  deposit:true,  bookings:32, icon:"🎨",   active:true },
  { id:"s3", name:"Mèches & Balayage",   cat:"Coiffure", dur:150, price:110, deposit:true,  bookings:27, icon:"✨",   active:true },
  { id:"s4", name:"Pose Gel Express",    cat:"Onglerie", dur:45,  price:35,  deposit:true,  bookings:19, icon:"💅",   active:true },
  { id:"s5", name:"Soin Kératine",       cat:"Soin",     dur:90,  price:65,  deposit:true,  bookings:11, icon:"🌿",   active:false },
];

export const REVENUE_MONTHLY = [1820,2100,2340,1980,2650,2890,3100,2760,3240,3680,4120,4890];
export const MONTHS_S = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];
export const WDAYS = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
export const HOURS = ["08","09","10","11","12","13","14","15","16","17","18"];

export const fmt = n => n >= 1000 ? `${(n/1000).toFixed(1)}k` : `${n}`;
export const SL = { confirmed:"Confirmé", pending:"En attente", cancelled:"Annulé", no_show:"No-show", done:"Terminé" };
