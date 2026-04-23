export type DepartmentsRegion = {
  name: string;
  numDpt: string[];
  isDrom?: boolean;
};

export const departmentsRegion: DepartmentsRegion[] = [
  { name: "Auvergne-Rhône-Alpes", numDpt: ["01", "03", "07", "15", "26", "38", "42", "43", "63", "69", "73", "74"], isDrom: false },
  { name: "Bourgogne-Franche-Comté", numDpt: ["21", "25", "39", "58", "70", "71", "89", "90"], isDrom: false },
  { name: "Bretagne", numDpt: ["22", "29", "35", "56"], isDrom: false },
  { name: "Centre-Val de Loire", numDpt: ["18", "28", "36", "37", "41", "45"], isDrom: false },
  { name: "Corse", numDpt: ["2A", "2B"], isDrom: false },
  { name: "Grand Est", numDpt: ["08", "10", "51", "52", "54", "55", "57", "67", "68", "88"], isDrom: false },
  { name: "Hauts-de-France", numDpt: ["02", "59", "60", "62", "80"], isDrom: false },
  { name: "Île-de-France", numDpt: ["75", "77", "78", "91", "92", "93", "94", "95"], isDrom: false },
  { name: "Normandie", numDpt: ["14", "27", "50", "61", "76"], isDrom: false },
  { name: "Nouvelle-Aquitaine", numDpt: ["16", "17", "19", "23", "24", "33", "40", "47", "64", "79", "86", "87"], isDrom: false },
  { name: "Occitanie", numDpt: ["09", "11", "12", "30", "31", "32", "34", "46", "48", "65", "66", "81", "82"], isDrom: false },
  { name: "Pays de la Loire", numDpt: ["44", "49", "53", "72", "85"], isDrom: false },
  { name: "Provence-Alpes-Côte d’Azur", numDpt: ["04", "05", "06", "13", "83", "84"], isDrom: false },

  // DROM
  { name: "Guadeloupe", numDpt: ["971"], isDrom: true },
  { name: "Martinique", numDpt: ["972"], isDrom: true },
  { name: "Guyane", numDpt: ["973"], isDrom: true },
  { name: "La Réunion", numDpt: ["974"], isDrom: true },
  { name: "Mayotte", numDpt: ["976"], isDrom: true },
];
