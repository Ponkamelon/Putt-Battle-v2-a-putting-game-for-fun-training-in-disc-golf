"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus, X, Check, ChevronRight, RotateCcw, Trophy, Target, Sparkles, Shield } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const LOGO_DATA_URI = "data:image/webp;base64,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";

// ---------- Design tokens ----------
const T = {
  bg: "#0E2417",
  bg2: "#123420",
  surface: "#16412A",
  surfaceLine: "#215536",
  ink: "#F3F7EE",
  inkDim: "#9FC2AC",
  accent: "#FFC845",
  accentInk: "#1A2E12",
  good: "#6FE0A0",
  bad: "#F0654B",
  chain: "#C7D6C9",
  gold: "#FFD866",
  press: "#B98CFF",
};

const DISPLAY_FONT = '"Archivo Black", "Arial Black", sans-serif';
const BODY_FONT = '"Work Sans", system-ui, sans-serif';
const MONO_FONT = '"IBM Plex Mono", monospace';

const LANGUAGES = ["swe", "eng", "fra", "esp"];
const LANG_LABEL = { swe: "SV", eng: "EN", fra: "FR", esp: "ES" };
const PRIVACY_FILES = { swe: "privacy.html", eng: "privacy-en.html", fra: "privacy-fr.html", esp: "privacy-es.html" };

// Detect the browser/device language and map it to one of our supported codes.
// Falls back to English if the browser's language isn't one we support.
function detectLanguage() {
  if (typeof navigator === "undefined") return "eng";
  const candidates = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""];
  for (const raw of candidates) {
    const code = (raw || "").toLowerCase();
    if (code.startsWith("sv")) return "swe";
    if (code.startsWith("fr")) return "fra";
    if (code.startsWith("es")) return "esp";
    if (code.startsWith("en")) return "eng";
  }
  return "eng";
}

// ---------- Language strings ----------
const STRINGS = {
  swe: {
    tagline: "TRÄNA · TÄVLA · SKRATTA · UPPREPA",
    newMatch: "Ny match",
    sectionPlayers: "Spelare", playersSuffix: "spelare (2–10)",
    sectionDifficulty: "Svårighetsgrad",
    sectionWinScore: "Poäng för vinst",
    sectionMaxDistance: "Maxavstånd",
    sectionPerks: "Perks", perksToggle: "Lotta ut perks vid 3 träffar i rad",
    sectionPress: "Press", pressToggle: "Slumpa Press-utmaningar (1/10 chans per kast)",
    sectionChallenge: "Challenge",
    sectionLanguage: "Språk",
    sectionBeforeStart: "Innan ni börjar",
    onboardingMarker: "📍 Varje spelare lägger en markering (t.ex. en mini-markör eller ett föremål) där hen står, så det är lätt att hitta tillbaka till rätt position efter att ha hämtat discen.",
    mechanicsHint: "Varje kast avgör ditt nästa avstånd: sätter du flyttas du bakåt (svårare), missar du flyttas du framåt (lättare). Vid 4–10m rör du dig 1 steg i taget; längre bort 2–3 steg. Sidledssteg (1–3) simulerar hinder som träd i terrängen. Första kastet i matchen är alltid neutralt.",
    rulesLink: "ℹ️ Regler & förklaringar",
    rulesTitle: "Regler & förklaringar",
    backButton: "← Tillbaka",
    rulesPerksDesc: "Var tredje träff i rad lottar fram en perk. Du väljer om du använder den själv eller ger den till en motspelare — hela gruppen får rösta (Publikröst).",
    rulesPressDesc: "Ibland (ca 1 av 10 kast) dyker en Press-utmaning upp innan du kastar. Sätter du får du en bonus: Mulligan (kasta om senare), Byt (byt kastplats), Kaos (alla flyttar sig) eller Approach (garanterad tvåkastare).",
    rulesChallengeDesc: "Vem som helst kan utmana kastaren innan Satt/Miss registreras. Gissar utmanaren rätt (att kastaren missar) vinner hen 1 poäng — annars förlorar hen 1 poäng.",
    rulesStepsTitle: "Steg och avstånd",
    objectiveTitle: "Mål",
    objectiveDesc: "Bli den första spelaren att nå målpoängen genom att sätta puttar och approach-kast samtidigt som du klarar roliga utmaningar längs vägen.",
    howToPlayTitle: "Så spelar du",
    howToPlaySteps: ["Läs utmaningen.", "Kasta.", "Tryck Satt eller Miss.", "Lämna över turen."],
    howToPlayClosing: "Det är allt!",
    scoringTitle: "Poängsystem",
    scoringItems: ["Sätter du kastet = du får poäng.", "Flytta 1 meter längre bort från korgen efter varje satt kast.", "Missar du = du står kvar.", "Första spelaren till målpoängen vinner."],
    perksIntroDesc: "Gör bra kast, bygg streaks och lås upp slumpmässiga perks som ger skratt och variation.",
    perksPhilosophy: "Perks är gjorda för att skapa skratt — inte för att avgöra vinnaren.",
    fairPlayTitle: "Fair Play",
    fairPlayIntro: "Discgolf är en gentlemanna- och gentlewoman-sport byggd på ärlighet, respekt och god sportsmannaanda.",
    fairPlayNoReferees: "Det finns inga domare — bara spelare.",
    fairPlayItems: ["Var ärlig.", "Respektera dina vänner.", "Fira bra kast.", "Skratta åt de dåliga.", "Kom ihåg: ni spelar med vänner, inte mot fiender."],
    fairPlayClosing: "Den bästa spelaren ska vinna, och alla ska gå därifrån leende.",
    mostImportantTitle: "Viktigaste regeln",
    mostImportantDesc: "Ha kul. Peppa varandra. Och när matchen är slut... kör en match till! 🥏",
    startPlayFriends: "Play with Friends", startPlaySolo: "Play Solo",
    youLabel: "Du",
    backToStart: "← Startsida",
    privacyPolicyLabel: "Integritetspolicy",
    statsBreakdownHand: "Träffar per hand", statsBreakdownDistance: "Träffar per avstånd",
    noThrowsLogged: "Inga kast loggade än.",
    soloResultsTitle: "Sessionen klar!",
    finalScoreLabel: "SLUTPOÄNG",
    personalRecordsTitle: "Personliga rekord",
    newRecordBadge: "🆕 Nytt rekord!",
    sessionsPlayedLabel: "Sessioner spelade (denna webbläsare)",
    lastSessionsTitle: "Senaste sessionerna",
    playAgainSolo: "🎯 SPELA IGEN (SOLO)",
    toStartScreen: "🏠 TILL STARTSIDAN",
    noHistoryNote: "Historik sparas bara under den här sessionen i webbläsaren — fullständig historik mellan besök kräver ett konto (planerat i en senare version).",
    recHighScore: "Högsta poäng", recBestStreak: "Längsta streak", recPuttPct: "Högsta puttprocent",
    recLongestPutt: "Längsta satta putt", recLongestApproach: "Längsta satta approach", recHighestDistance: "Högsta avstånd nått",
    sessionLabel: "Session {n}",
    startMatch: "STARTA MATCH",
    difficultyBeginner: "Beginner", difficultyAmateur: "Amateur", difficultyPro: "Pro",
    nowThrowing: "Nu kastar", streakLabel: "Streak: {n}", distanceLabel: "AVSTÅND",
    baseDistanceNote: "(bas {base}m {sign})", signForward: "− fram", signBack: "+ bak",
    noStep: "Inget steg — kasta från startpositionen.",
    take: "Ta", stepsWord: "steg", back: "bak", forward: "fram", right: "höger", left: "vänster", andWord: "och",
    basketLabel: "KORG · NORR",
    pressPrefix: "🔥 Press — {label}",
    tagKnee: "Ett knä i marken (+1)", tagWeakHand: "Svag hand", tagDoublePoints: "Dubbel poäng",
    tagApproach: "Approach · {n} kast", tagApproachForced: "Forcerad approach!",
    throwProgress: "Kast {done} av {needed} · {left} kvar",
    missedTitle: "Du missade!",
    mulliganPrompt: "Du har en mulligan i behåll. Vill du använda den och kasta om?",
    mulliganDecline: "Nej, räkna som miss", mulliganUse: "🔁 Använd mulligan",
    missButton: "MISS", hitButton: "SATT",
    perkGolden: "Golden perk", perkNormal: "Perk", perkStreakSuffix: "{name} har 3 i rad!",
    perkWhoGets: "VEM SKA FÅ DEN?", perkUseSelf: "Använd själv ({name})", perkGiveTo: "Ge till {name}",
    swapKicker: "Press · Byt · {name} satte!", swapQuestion: "Vem vill du byta kastplats med?", swapWith: "Byt med {name}",
    winnerLabel: "VINNARE", playAgain: "SPELA IGEN",
    statHit: "Träff", statPutt: "Putt", statApproach: "Approach", statForehand: "Forehand", statBackhand: "Backhand", statLongestPutt: "Längsta putt",
    perkDoubleLabel: "Dubbel poäng", perkDoubleDesc: "Nästa träff ger dubbla poäng.",
    perkForceForehandLabel: "Tvinga forehand", perkForceForehandDesc: "Nästa kast måste vara forehand.",
    perkForceBackhandLabel: "Tvinga backhand", perkForceBackhandDesc: "Nästa kast måste vara backhand.",
    perkForceKneeLabel: "Tvinga knä", perkForceKneeDesc: "Nästa kast tas med ett knä i marken.",
    perkPushStepsLabel: "Flytta 2 steg", perkPushStepsDesc: "+2 sidledsteg på nästa kast.",
    perkImmuneLabel: "Immun", perkImmuneDesc: "Skyddar mot nästa negativa perk riktad mot dig.",
    perkStealLabel: "Stjäl 1 poäng", perkStealDesc: "Sällsynt. Ta 1 poäng direkt.",
    perkApproachLabel: "Approach-utmaning", perkApproachDesc: "Ditt nästa kast blir en approach (2 kast, högre poäng) — oavsett var du står.",
    pressMulliganLabel: "Mulligan", pressMulliganDesc: "Sätter du får du en mulligan att spara — använd den senare när du missar för att kasta om.",
    pressBytLabel: "Byt", pressBytDesc: "Sätter du får du byta kastplats med en valfri motspelare.",
    pressKaosLabel: "Kaos", pressKaosDesc: "Sätter du flyttas alla spelare 1–3 steg i samma riktning.",
    pressApproachLabel: "Approach", pressApproachDesc: "Sätter du garanteras en approach-utmaning (2 kast, högre poäng) på nästa kast.",
    evImmuneBlocked: "{target} var immun — {perk} blockerades!",
    evStolePoints: "{drawer} stal {amount} poäng från {target}.",
    evPerkGiven: '{target} fick perken "{perk}".',
    evMulliganUsed: "{name} använde en mulligan och kastar om.",
    evMulliganWon: "{name} vann en mulligan att spara till senare!",
    evKaos: "Kaos! Alla spelare flyttade {mag} steg {dir}.",
    evSwap: "{a} och {b} bytte kastplats!",
    dirBack: "bakåt", dirForward: "framåt",
    perkSabotageLabel: "Sabotage", perkSabotageDesc: "Nästa kast måste tas med en vald motspelares putter.",
    sabotageTag: "Kasta med {name}s putter",
    publikrostPrefix: "🗳️ Publikröst — ",
    readyLabel: "KLART.",
    challengeButton: "🎲 Utmana", challengeWho: "Vem utmanar {name}?",
    challengeBadge: "🎲 {name} utmanar!",
    evChallengeWin: "{name} vann Challenge — +1 poäng!",
    evChallengeLose: "{name} förlorade Challenge — −1 poäng.",
    awardsHero: "Matchens hjälte", awardsMostForehand: "Flest forehand", awardsMostPerks: "Flest perks", awardsComeback: "Snyggaste comeback",
    showStats: "Visa detaljerad statistik", hideStats: "Dölj detaljerad statistik",
  },
  eng: {
    tagline: "TRAIN · COMPETE · LAUGH · REPEAT",
    newMatch: "New match",
    sectionPlayers: "Players", playersSuffix: "players (2–10)",
    sectionDifficulty: "Difficulty",
    sectionWinScore: "Points to win",
    sectionMaxDistance: "Max distance",
    sectionPerks: "Perks", perksToggle: "Draw a perk after 3 hits in a row",
    sectionPress: "Press", pressToggle: "Randomize Press challenges (1/10 chance per throw)",
    sectionChallenge: "Challenge",
    sectionLanguage: "Language",
    sectionBeforeStart: "Before you start",
    onboardingMarker: "📍 Each player places a marker (e.g. a mini marker or an object) where they stand, so it's easy to find the right spot again after fetching the disc.",
    mechanicsHint: "Every throw decides your next distance: make it and you move back (harder), miss it and you move forward (easier). At 4–10m you move 1 step at a time; farther out, 2–3 steps. Sideways steps (1–3) simulate obstacles like trees. The match's first throw is always neutral.",
    rulesLink: "ℹ️ Rules & explanations",
    rulesTitle: "Rules & explanations",
    backButton: "← Back",
    rulesPerksDesc: "Every third hit in a row draws a perk. You choose whether to use it yourself or give it to an opponent — the whole group gets to vote (Crowd vote).",
    rulesPressDesc: "Sometimes (about 1 in 10 throws) a Press challenge appears before you throw. Make it and you get a bonus: Mulligan (retry later), Swap (swap throwing spot), Chaos (everyone shifts), or Approach (guaranteed 2-throw attempt).",
    rulesChallengeDesc: "Anyone can challenge the thrower before Made/Miss is registered. If the challenger guesses right (that the thrower misses), they win 1 point — otherwise they lose 1 point.",
    rulesStepsTitle: "Steps and distance",
    objectiveTitle: "Objective",
    objectiveDesc: "Be the first player to reach the target score by making putts and approach shots while completing fun challenges along the way.",
    howToPlayTitle: "How to Play",
    howToPlaySteps: ["Read the challenge.", "Throw.", "Tap Made or Missed.", "Pass the turn."],
    howToPlayClosing: "That's it!",
    scoringTitle: "Scoring",
    scoringItems: ["Make the throw = earn points.", "Move 1 meter farther from the basket after every successful throw.", "Miss = stay where you are.", "First player to the target score wins."],
    perksIntroDesc: "Make great shots, build streaks and unlock random perks that add fun and variety.",
    perksPhilosophy: "Perks are designed to create laughs—not to decide the winner.",
    fairPlayTitle: "Fair Play",
    fairPlayIntro: "Disc golf is a gentleman's and gentlewoman's sport built on honesty, respect and sportsmanship.",
    fairPlayNoReferees: "There are no referees—only players.",
    fairPlayItems: ["Be honest.", "Respect your friends.", "Celebrate great shots.", "Laugh at the bad ones.", "Remember: you're playing with friends, not against enemies."],
    fairPlayClosing: "The best player should win, and everyone should leave smiling.",
    mostImportantTitle: "Most Important Rule",
    mostImportantDesc: "Have fun. Encourage each other. And when the match is over... play one more! 🥏",
    startPlayFriends: "Play with Friends", startPlaySolo: "Play Solo",
    youLabel: "You",
    backToStart: "← Home",
    privacyPolicyLabel: "Privacy Policy",
    statsBreakdownHand: "Hits by hand", statsBreakdownDistance: "Hits by distance",
    noThrowsLogged: "No throws logged yet.",
    soloResultsTitle: "Session complete!",
    finalScoreLabel: "FINAL SCORE",
    personalRecordsTitle: "Personal Records",
    newRecordBadge: "🆕 New record!",
    sessionsPlayedLabel: "Sessions played (this browser)",
    lastSessionsTitle: "Last sessions",
    playAgainSolo: "🎯 PLAY AGAIN (SOLO)",
    toStartScreen: "🏠 HOME",
    noHistoryNote: "History is only kept for this browser session — full history across visits requires an account (planned for a later version).",
    recHighScore: "Highest score", recBestStreak: "Longest streak", recPuttPct: "Highest putting %",
    recLongestPutt: "Longest made putt", recLongestApproach: "Longest made approach", recHighestDistance: "Highest distance reached",
    sessionLabel: "Session {n}",
    startMatch: "START MATCH",
    difficultyBeginner: "Beginner", difficultyAmateur: "Amateur", difficultyPro: "Pro",
    nowThrowing: "Now throwing", streakLabel: "Streak: {n}", distanceLabel: "DISTANCE",
    baseDistanceNote: "(base {base}m {sign})", signForward: "− forward", signBack: "+ back",
    noStep: "No step — throw from the starting position.",
    take: "Take", stepsWord: "steps", back: "back", forward: "forward", right: "right", left: "left", andWord: "and",
    basketLabel: "BASKET · NORTH",
    pressPrefix: "🔥 Press — {label}",
    tagKnee: "One knee down (+1)", tagWeakHand: "Off-hand", tagDoublePoints: "Double points",
    tagApproach: "Approach · {n} throws", tagApproachForced: "Forced approach!",
    throwProgress: "Throw {done} of {needed} · {left} left",
    missedTitle: "You missed!",
    mulliganPrompt: "You have a mulligan banked. Use it and retry the throw?",
    mulliganDecline: "No, count as a miss", mulliganUse: "🔁 Use mulligan",
    missButton: "MISS", hitButton: "MADE",
    perkGolden: "Golden perk", perkNormal: "Perk", perkStreakSuffix: "{name} has 3 in a row!",
    perkWhoGets: "WHO GETS IT?", perkUseSelf: "Use it yourself ({name})", perkGiveTo: "Give to {name}",
    swapKicker: "Press · Swap · {name} made it!", swapQuestion: "Who do you want to swap throwing spots with?", swapWith: "Swap with {name}",
    winnerLabel: "WINNER", playAgain: "PLAY AGAIN",
    statHit: "Hit", statPutt: "Putt", statApproach: "Approach", statForehand: "Forehand", statBackhand: "Backhand", statLongestPutt: "Longest putt",
    perkDoubleLabel: "Double points", perkDoubleDesc: "Your next hit scores double points.",
    perkForceForehandLabel: "Force forehand", perkForceForehandDesc: "Your next throw must be forehand.",
    perkForceBackhandLabel: "Force backhand", perkForceBackhandDesc: "Your next throw must be backhand.",
    perkForceKneeLabel: "Force knee", perkForceKneeDesc: "Your next throw is taken with a knee on the ground.",
    perkPushStepsLabel: "Shove 2 steps", perkPushStepsDesc: "+2 sideways steps on the next throw.",
    perkImmuneLabel: "Immune", perkImmuneDesc: "Protects you from the next negative perk aimed at you.",
    perkStealLabel: "Steal 1 point", perkStealDesc: "Rare. Take 1 point immediately.",
    perkApproachLabel: "Approach challenge", perkApproachDesc: "Your next throw becomes an approach (2 throws, higher points) — no matter your distance.",
    pressMulliganLabel: "Mulligan", pressMulliganDesc: "Make it and you bank a mulligan — use it later when you miss to retry.",
    pressBytLabel: "Swap", pressBytDesc: "Make it and you can swap throwing spots with any opponent.",
    pressKaosLabel: "Chaos", pressKaosDesc: "Make it and everyone shifts 1–3 steps in the same direction.",
    pressApproachLabel: "Approach", pressApproachDesc: "Make it and your next throw is guaranteed to be an approach (2 throws, higher points).",
    evImmuneBlocked: "{target} was immune — {perk} was blocked!",
    evStolePoints: "{drawer} stole {amount} point from {target}.",
    evPerkGiven: '{target} received the perk "{perk}".',
    evMulliganUsed: "{name} used a mulligan and retries the throw.",
    evMulliganWon: "{name} banked a mulligan to use later!",
    evKaos: "Chaos! Everyone shifted {mag} steps {dir}.",
    evSwap: "{a} and {b} swapped throwing spots!",
    dirBack: "backward", dirForward: "forward",
    perkSabotageLabel: "Sabotage", perkSabotageDesc: "Your next throw must be taken with a chosen opponent's putter.",
    sabotageTag: "Throw with {name}'s putter",
    publikrostPrefix: "🗳️ Crowd vote — ",
    readyLabel: "READY.",
    challengeButton: "🎲 Challenge", challengeWho: "Who's challenging {name}?",
    challengeBadge: "🎲 {name} challenges!",
    evChallengeWin: "{name} won the Challenge — +1 point!",
    evChallengeLose: "{name} lost the Challenge — −1 point.",
    awardsHero: "MVP", awardsMostForehand: "Most forehand", awardsMostPerks: "Most perks", awardsComeback: "Best comeback",
    showStats: "Show detailed stats", hideStats: "Hide detailed stats",
  },
  fra: {
    tagline: "S'ENTRAÎNER · RIVALISER · RIRE · RECOMMENCER",
    newMatch: "Nouvelle partie",
    sectionPlayers: "Joueurs", playersSuffix: "joueurs (2–10)",
    sectionDifficulty: "Difficulté",
    sectionWinScore: "Points pour gagner",
    sectionMaxDistance: "Distance max",
    sectionPerks: "Bonus", perksToggle: "Tirer un bonus après 3 réussites d'affilée",
    sectionPress: "Press", pressToggle: "Défis Press aléatoires (1 chance sur 10 par lancer)",
    sectionChallenge: "Challenge",
    sectionLanguage: "Langue",
    sectionBeforeStart: "Avant de commencer",
    onboardingMarker: "📍 Chaque joueur pose un repère (par ex. un mini-marqueur ou un objet) à l'endroit où il se tient, pour retrouver facilement sa position après être allé chercher le disque.",
    mechanicsHint: "Chaque lancer détermine votre prochaine distance : réussissez et vous reculez (plus difficile), ratez et vous avancez (plus facile). Entre 4 et 10 m, vous bougez d'1 pas à la fois ; plus loin, de 2 à 3 pas. Les pas de côté (1 à 3) simulent des obstacles comme des arbres. Le premier lancer du match est toujours neutre.",
    rulesLink: "ℹ️ Règles & explications",
    rulesTitle: "Règles & explications",
    backButton: "← Retour",
    rulesPerksDesc: "Toutes les trois réussites d'affilée tirent un bonus. Vous choisissez de l'utiliser vous-même ou de le donner à un adversaire — tout le groupe vote (Vote du public).",
    rulesPressDesc: "Parfois (environ 1 lancer sur 10) un défi Press apparaît avant votre lancer. Réussissez et obtenez un bonus : Mulligan (relancer plus tard), Échange (échanger sa position), Chaos (tout le monde se déplace) ou Approach (lancer à 2 garanti).",
    rulesChallengeDesc: "N'importe qui peut défier le lanceur avant que Réussi/Raté soit enregistré. Si le challenger devine juste (que le lanceur rate), il gagne 1 point — sinon il en perd 1.",
    rulesStepsTitle: "Pas et distance",
    objectiveTitle: "Objectif",
    objectiveDesc: "Soyez le premier joueur à atteindre le score cible en réussissant des putts et des approches, tout en relevant des défis amusants en cours de route.",
    howToPlayTitle: "Comment jouer",
    howToPlaySteps: ["Lisez le défi.", "Lancez.", "Appuyez sur Réussi ou Raté.", "Passez le tour."],
    howToPlayClosing: "C'est tout !",
    scoringTitle: "Système de points",
    scoringItems: ["Réussir le lancer = gagner des points.", "Avancez d'1 mètre plus loin du panier après chaque lancer réussi.", "Raté = vous restez sur place.", "Le premier joueur à atteindre le score cible gagne."],
    perksIntroDesc: "Réussissez de beaux lancers, enchaînez les séries et débloquez des bonus aléatoires qui apportent du fun et de la variété.",
    perksPhilosophy: "Les bonus sont conçus pour faire rire — pas pour désigner le vainqueur.",
    fairPlayTitle: "Fair-play",
    fairPlayIntro: "Le disc golf est un sport de gentlemen et gentlewomen fondé sur l'honnêteté, le respect et l'esprit sportif.",
    fairPlayNoReferees: "Il n'y a pas d'arbitres — seulement des joueurs.",
    fairPlayItems: ["Soyez honnête.", "Respectez vos amis.", "Célébrez les beaux lancers.", "Riez des ratés.", "N'oubliez pas : vous jouez avec des amis, pas contre des ennemis."],
    fairPlayClosing: "Le meilleur joueur doit gagner, et tout le monde doit repartir avec le sourire.",
    mostImportantTitle: "La règle la plus importante",
    mostImportantDesc: "Amusez-vous. Encouragez-vous les uns les autres. Et quand la partie est finie... rejouez-en une ! 🥏",
    startPlayFriends: "Play with Friends", startPlaySolo: "Play Solo",
    youLabel: "Vous",
    backToStart: "← Accueil",
    privacyPolicyLabel: "Politique de confidentialité",
    statsBreakdownHand: "Réussites par main", statsBreakdownDistance: "Réussites par distance",
    noThrowsLogged: "Aucun lancer enregistré pour l'instant.",
    soloResultsTitle: "Session terminée !",
    finalScoreLabel: "SCORE FINAL",
    personalRecordsTitle: "Records personnels",
    newRecordBadge: "🆕 Nouveau record !",
    sessionsPlayedLabel: "Sessions jouées (ce navigateur)",
    lastSessionsTitle: "Dernières sessions",
    playAgainSolo: "🎯 REJOUER (SOLO)",
    toStartScreen: "🏠 ACCUEIL",
    noHistoryNote: "L'historique n'est conservé que pour cette session du navigateur — l'historique complet entre visites nécessite un compte (prévu pour une version ultérieure).",
    recHighScore: "Meilleur score", recBestStreak: "Plus longue série", recPuttPct: "Meilleur % de putts",
    recLongestPutt: "Putt le plus long réussi", recLongestApproach: "Approach le plus long réussi", recHighestDistance: "Plus grande distance atteinte",
    sessionLabel: "Session {n}",
    startMatch: "COMMENCER",
    difficultyBeginner: "Débutant", difficultyAmateur: "Amateur", difficultyPro: "Pro",
    nowThrowing: "Au lancer", streakLabel: "Série : {n}", distanceLabel: "DISTANCE",
    baseDistanceNote: "(base {base}m {sign})", signForward: "− avant", signBack: "+ arrière",
    noStep: "Aucun pas — lancez depuis la position de départ.",
    take: "Faites", stepsWord: "pas", back: "en arrière", forward: "en avant", right: "à droite", left: "à gauche", andWord: "et",
    basketLabel: "PANIER · NORD",
    pressPrefix: "🔥 Press — {label}",
    tagKnee: "Un genou au sol (+1)", tagWeakHand: "Main faible", tagDoublePoints: "Points doublés",
    tagApproach: "Approach · {n} lancers", tagApproachForced: "Approach forcé !",
    throwProgress: "Lancer {done} sur {needed} · {left} restant(s)",
    missedTitle: "Raté !",
    mulliganPrompt: "Vous avez un mulligan en réserve. L'utiliser et relancer ?",
    mulliganDecline: "Non, comptez comme raté", mulliganUse: "🔁 Utiliser le mulligan",
    missButton: "RATÉ", hitButton: "RÉUSSI",
    perkGolden: "Bonus doré", perkNormal: "Bonus", perkStreakSuffix: "{name} enchaîne 3 réussites !",
    perkWhoGets: "QUI LA REÇOIT ?", perkUseSelf: "Utiliser soi-même ({name})", perkGiveTo: "Donner à {name}",
    swapKicker: "Press · Échange · {name} a réussi !", swapQuestion: "Avec qui voulez-vous échanger votre position de lancer ?", swapWith: "Échanger avec {name}",
    winnerLabel: "VAINQUEUR", playAgain: "REJOUER",
    statHit: "Réussite", statPutt: "Putt", statApproach: "Approach", statForehand: "Forehand", statBackhand: "Backhand", statLongestPutt: "Putt le plus long",
    perkDoubleLabel: "Points doublés", perkDoubleDesc: "Votre prochaine réussite rapporte des points doublés.",
    perkForceForehandLabel: "Forcer forehand", perkForceForehandDesc: "Le prochain lancer doit être en forehand.",
    perkForceBackhandLabel: "Forcer backhand", perkForceBackhandDesc: "Le prochain lancer doit être en backhand.",
    perkForceKneeLabel: "Forcer genou", perkForceKneeDesc: "Le prochain lancer se fait avec un genou au sol.",
    perkPushStepsLabel: "Décaler de 2 pas", perkPushStepsDesc: "+2 pas de côté au prochain lancer.",
    perkImmuneLabel: "Immunisé", perkImmuneDesc: "Vous protège du prochain bonus négatif dirigé contre vous.",
    perkStealLabel: "Voler 1 point", perkStealDesc: "Rare. Prenez 1 point immédiatement.",
    perkApproachLabel: "Défi Approach", perkApproachDesc: "Votre prochain lancer devient un Approach (2 lancers, plus de points) — quelle que soit votre distance.",
    pressMulliganLabel: "Mulligan", pressMulliganDesc: "Réussissez et vous gagnez un mulligan à garder — utilisez-le plus tard en cas de raté pour relancer.",
    pressBytLabel: "Échange", pressBytDesc: "Réussissez et échangez votre position de lancer avec un adversaire de votre choix.",
    pressKaosLabel: "Chaos", pressKaosDesc: "Réussissez et tout le monde se déplace de 1 à 3 pas dans la même direction.",
    pressApproachLabel: "Approach", pressApproachDesc: "Réussissez et votre prochain lancer est garanti d'être un Approach (2 lancers, plus de points).",
    evImmuneBlocked: "{target} était immunisé — {perk} a été bloqué !",
    evStolePoints: "{drawer} a volé {amount} point à {target}.",
    evPerkGiven: '{target} a reçu le bonus « {perk} ».',
    evMulliganUsed: "{name} a utilisé un mulligan et relance.",
    evMulliganWon: "{name} a gagné un mulligan à garder pour plus tard !",
    evKaos: "Chaos ! Tout le monde s'est déplacé de {mag} pas {dir}.",
    evSwap: "{a} et {b} ont échangé leur position de lancer !",
    dirBack: "en arrière", dirForward: "en avant",
    perkSabotageLabel: "Sabotage", perkSabotageDesc: "Le prochain lancer doit être fait avec le putter d'un adversaire choisi.",
    sabotageTag: "Lancer avec le putter de {name}",
    publikrostPrefix: "🗳️ Vote du public — ",
    readyLabel: "PRÊT.",
    challengeButton: "🎲 Défier", challengeWho: "Qui défie {name} ?",
    challengeBadge: "🎲 {name} défie !",
    evChallengeWin: "{name} a gagné le Challenge — +1 point !",
    evChallengeLose: "{name} a perdu le Challenge — −1 point.",
    awardsHero: "Héros du match", awardsMostForehand: "Plus de forehand", awardsMostPerks: "Plus de bonus", awardsComeback: "Plus beau comeback",
    showStats: "Afficher les statistiques détaillées", hideStats: "Masquer les statistiques détaillées",
  },
  esp: {
    tagline: "ENTRENA · COMPITE · RÍE · REPITE",
    newMatch: "Nueva partida",
    sectionPlayers: "Jugadores", playersSuffix: "jugadores (2–10)",
    sectionDifficulty: "Dificultad",
    sectionWinScore: "Puntos para ganar",
    sectionMaxDistance: "Distancia máxima",
    sectionPerks: "Bonus", perksToggle: "Sortear un bonus tras 3 aciertos seguidos",
    sectionPress: "Press", pressToggle: "Desafíos Press aleatorios (1/10 de probabilidad por lanzamiento)",
    sectionChallenge: "Challenge",
    sectionLanguage: "Idioma",
    sectionBeforeStart: "Antes de empezar",
    onboardingMarker: "📍 Cada jugador coloca una marca (por ejemplo, un mini-marcador o un objeto) donde se encuentra, para encontrar fácilmente el lugar correcto después de recoger el disco.",
    mechanicsHint: "Cada lanzamiento determina tu próxima distancia: si aciertas, retrocedes (más difícil); si fallas, avanzas (más fácil). A 4–10 m te mueves 1 paso a la vez; más lejos, 2–3 pasos. Los pasos laterales (1–3) simulan obstáculos como árboles. El primer lanzamiento del partido siempre es neutral.",
    rulesLink: "ℹ️ Reglas y explicaciones",
    rulesTitle: "Reglas y explicaciones",
    backButton: "← Volver",
    rulesPerksDesc: "Cada tres aciertos seguidos se sortea un bonus. Eliges si lo usas tú mismo o se lo das a un rival — todo el grupo vota (Voto del público).",
    rulesPressDesc: "A veces (aprox. 1 de cada 10 lanzamientos) aparece un desafío Press antes de lanzar. Si aciertas, obtienes un bonus: Mulligan (repetir más tarde), Cambio (intercambiar lugar), Caos (todos se mueven) o Approach (lanzamiento doble garantizado).",
    rulesChallengeDesc: "Cualquiera puede retar al lanzador antes de registrar Acierto/Fallo. Si el retador acierta su predicción (que el lanzador falla), gana 1 punto — si no, pierde 1 punto.",
    rulesStepsTitle: "Pasos y distancia",
    objectiveTitle: "Objetivo",
    objectiveDesc: "Sé el primer jugador en alcanzar la puntuación objetivo acertando putts y approaches, mientras completas desafíos divertidos por el camino.",
    howToPlayTitle: "Cómo jugar",
    howToPlaySteps: ["Lee el desafío.", "Lanza.", "Pulsa Acierto o Fallo.", "Pasa el turno."],
    howToPlayClosing: "¡Eso es todo!",
    scoringTitle: "Puntuación",
    scoringItems: ["Aciertas el lanzamiento = ganas puntos.", "Avanza 1 metro más lejos de la cesta tras cada lanzamiento acertado.", "Fallas = te quedas donde estás.", "El primer jugador en llegar a la puntuación objetivo gana."],
    perksIntroDesc: "Haz buenos lanzamientos, encadena rachas y desbloquea bonus aleatorios que añaden diversión y variedad.",
    perksPhilosophy: "Los bonus están pensados para generar risas — no para decidir al ganador.",
    fairPlayTitle: "Juego limpio",
    fairPlayIntro: "El disc golf es un deporte de caballeros y damas basado en la honestidad, el respeto y el espíritu deportivo.",
    fairPlayNoReferees: "No hay árbitros — solo jugadores.",
    fairPlayItems: ["Sé honesto.", "Respeta a tus amigos.", "Celebra los buenos lanzamientos.", "Ríete de los malos.", "Recuerda: juegas con amigos, no contra enemigos."],
    fairPlayClosing: "El mejor jugador debería ganar, y todos deberían irse sonriendo.",
    mostImportantTitle: "La regla más importante",
    mostImportantDesc: "Diviértete. Anímense entre ustedes. Y cuando termine el partido... ¡jueguen uno más! 🥏",
    startPlayFriends: "Play with Friends", startPlaySolo: "Play Solo",
    youLabel: "Tú",
    backToStart: "← Inicio",
    privacyPolicyLabel: "Política de privacidad",
    statsBreakdownHand: "Aciertos por mano", statsBreakdownDistance: "Aciertos por distancia",
    noThrowsLogged: "Aún no hay lanzamientos registrados.",
    soloResultsTitle: "¡Sesión completada!",
    finalScoreLabel: "PUNTUACIÓN FINAL",
    personalRecordsTitle: "Récords personales",
    newRecordBadge: "🆕 ¡Nuevo récord!",
    sessionsPlayedLabel: "Sesiones jugadas (este navegador)",
    lastSessionsTitle: "Últimas sesiones",
    playAgainSolo: "🎯 JUGAR DE NUEVO (SOLO)",
    toStartScreen: "🏠 INICIO",
    noHistoryNote: "El historial solo se guarda durante esta sesión del navegador — el historial completo entre visitas requiere una cuenta (previsto para una versión posterior).",
    recHighScore: "Puntuación más alta", recBestStreak: "Racha más larga", recPuttPct: "Mejor % de putts",
    recLongestPutt: "Putt más largo logrado", recLongestApproach: "Approach más largo logrado", recHighestDistance: "Distancia más alta alcanzada",
    sessionLabel: "Sesión {n}",
    startMatch: "EMPEZAR",
    difficultyBeginner: "Principiante", difficultyAmateur: "Amateur", difficultyPro: "Pro",
    nowThrowing: "Ahora lanza", streakLabel: "Racha: {n}", distanceLabel: "DISTANCIA",
    baseDistanceNote: "(base {base}m {sign})", signForward: "− adelante", signBack: "+ atrás",
    noStep: "Sin paso — lanza desde la posición inicial.",
    take: "Da", stepsWord: "pasos", back: "atrás", forward: "adelante", right: "a la derecha", left: "a la izquierda", andWord: "y",
    basketLabel: "CESTA · NORTE",
    pressPrefix: "🔥 Press — {label}",
    tagKnee: "Una rodilla en el suelo (+1)", tagWeakHand: "Mano débil", tagDoublePoints: "Puntos dobles",
    tagApproach: "Approach · {n} lanzamientos", tagApproachForced: "¡Approach forzado!",
    throwProgress: "Lanzamiento {done} de {needed} · {left} restante(s)",
    missedTitle: "¡Fallaste!",
    mulliganPrompt: "Tienes un mulligan guardado. ¿Quieres usarlo y repetir el lanzamiento?",
    mulliganDecline: "No, cuenta como fallo", mulliganUse: "🔁 Usar mulligan",
    missButton: "FALLO", hitButton: "ACIERTO",
    perkGolden: "Bonus dorado", perkNormal: "Bonus", perkStreakSuffix: "¡{name} lleva 3 seguidos!",
    perkWhoGets: "¿QUIÉN LA RECIBE?", perkUseSelf: "Usarlo tú mismo ({name})", perkGiveTo: "Dar a {name}",
    swapKicker: "Press · Cambio · ¡{name} acertó!", swapQuestion: "¿Con quién quieres intercambiar el lugar de lanzamiento?", swapWith: "Cambiar con {name}",
    winnerLabel: "GANADOR", playAgain: "JUGAR DE NUEVO",
    statHit: "Acierto", statPutt: "Putt", statApproach: "Approach", statForehand: "Forehand", statBackhand: "Backhand", statLongestPutt: "Putt más largo",
    perkDoubleLabel: "Puntos dobles", perkDoubleDesc: "Tu próximo acierto otorga puntos dobles.",
    perkForceForehandLabel: "Forzar forehand", perkForceForehandDesc: "Tu próximo lanzamiento debe ser forehand.",
    perkForceBackhandLabel: "Forzar backhand", perkForceBackhandDesc: "Tu próximo lanzamiento debe ser backhand.",
    perkForceKneeLabel: "Forzar rodilla", perkForceKneeDesc: "Tu próximo lanzamiento se hace con una rodilla en el suelo.",
    perkPushStepsLabel: "Mover 2 pasos", perkPushStepsDesc: "+2 pasos laterales en el próximo lanzamiento.",
    perkImmuneLabel: "Inmune", perkImmuneDesc: "Te protege del próximo bonus negativo dirigido a ti.",
    perkStealLabel: "Robar 1 punto", perkStealDesc: "Raro. Roba 1 punto de inmediato.",
    perkApproachLabel: "Desafío Approach", perkApproachDesc: "Tu próximo lanzamiento se convierte en un Approach (2 lanzamientos, más puntos) — sin importar tu distancia.",
    pressMulliganLabel: "Mulligan", pressMulliganDesc: "Si aciertas, guardas un mulligan — úsalo más tarde cuando falles para repetir.",
    pressBytLabel: "Cambio", pressBytDesc: "Si aciertas, puedes intercambiar el lugar de lanzamiento con cualquier rival.",
    pressKaosLabel: "Caos", pressKaosDesc: "Si aciertas, todos se mueven 1–3 pasos en la misma dirección.",
    pressApproachLabel: "Approach", pressApproachDesc: "Si aciertas, tu próximo lanzamiento tiene garantizado ser un Approach (2 lanzamientos, más puntos).",
    evImmuneBlocked: "{target} era inmune — ¡{perk} fue bloqueado!",
    evStolePoints: "{drawer} robó {amount} punto a {target}.",
    evPerkGiven: '{target} recibió el bonus «{perk}».',
    evMulliganUsed: "{name} usó un mulligan y repite el lanzamiento.",
    evMulliganWon: "¡{name} ganó un mulligan para usar más tarde!",
    evKaos: "¡Caos! Todos se movieron {mag} pasos {dir}.",
    evSwap: "¡{a} y {b} intercambiaron el lugar de lanzamiento!",
    dirBack: "hacia atrás", dirForward: "hacia adelante",
    perkSabotageLabel: "Sabotaje", perkSabotageDesc: "Tu próximo lanzamiento debe hacerse con el putter de un rival elegido.",
    sabotageTag: "Lanza con el putter de {name}",
    publikrostPrefix: "🗳️ Voto del público — ",
    readyLabel: "LISTO.",
    challengeButton: "🎲 Reto", challengeWho: "¿Quién reta a {name}?",
    challengeBadge: "🎲 ¡{name} reta!",
    evChallengeWin: "¡{name} ganó el Challenge — +1 punto!",
    evChallengeLose: "{name} perdió el Challenge — −1 punto.",
    awardsHero: "Héroe del partido", awardsMostForehand: "Más forehand", awardsMostPerks: "Más bonus", awardsComeback: "Mejor remontada",
    showStats: "Mostrar estadísticas detalladas", hideStats: "Ocultar estadísticas detalladas",
  },
};

function t(lang, key, vars) {
  let str = (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.swe[key] || key;
  if (vars) Object.entries(vars).forEach(([k, v]) => { str = str.split(`{${k}}`).join(v); });
  return str;
}

function getPerks(lang) {
  const s = STRINGS[lang];
  return [
    { id: "double", label: s.perkDoubleLabel, desc: s.perkDoubleDesc, negative: false },
    { id: "forceForehand", label: s.perkForceForehandLabel, desc: s.perkForceForehandDesc, negative: true },
    { id: "forceBackhand", label: s.perkForceBackhandLabel, desc: s.perkForceBackhandDesc, negative: true },
    { id: "forceKnee", label: s.perkForceKneeLabel, desc: s.perkForceKneeDesc, negative: true },
    { id: "pushSteps", label: s.perkPushStepsLabel, desc: s.perkPushStepsDesc, negative: true },
    { id: "immune", label: s.perkImmuneLabel, desc: s.perkImmuneDesc, negative: false },
    { id: "steal", label: s.perkStealLabel, desc: s.perkStealDesc, negative: true, golden: true },
    { id: "approach", label: s.perkApproachLabel, desc: s.perkApproachDesc, negative: true },
    { id: "sabotage", label: s.perkSabotageLabel, desc: s.perkSabotageDesc, negative: true },
  ];
}

function getPressTypes(lang) {
  const s = STRINGS[lang];
  return [
    { id: "mulligan", label: s.pressMulliganLabel, desc: s.pressMulliganDesc },
    { id: "byt", label: s.pressBytLabel, desc: s.pressBytDesc },
    { id: "kaos", label: s.pressKaosLabel, desc: s.pressKaosDesc },
    { id: "approach", label: s.pressApproachLabel, desc: s.pressApproachDesc },
  ];
}

const DIFFICULTIES = {
  beginner: { key: "difficultyBeginner", start: 3, hands: ["backhand"], kneeAvailable: false, weakHandAvailable: false },
  amateur: { key: "difficultyAmateur", start: 4, hands: ["backhand", "forehand"], kneeAvailable: true, weakHandAvailable: false },
  pro: { key: "difficultyPro", start: 5, hands: ["backhand", "forehand"], kneeAvailable: true, weakHandAvailable: true },
};

const PLAYER_COLORS = [
  "#FFC845", "#5BC8FF", "#FF6FA8", "#B98CFF", "#7CE38B",
  "#FF9F5A", "#66E0D0", "#C5E86C", "#9AA5FF", "#FF8F8F",
];

function scoreFor(distance) {
  if (distance <= 10) return { points: 1, kind: "putt", throws: 1 };
  if (distance <= 15) return { points: 2, kind: "putt", throws: 1 };
  if (distance <= 20) return { points: 2, kind: "approach", throws: 2 };
  return { points: 3, kind: "approach", throws: 2 };
}

function rand(n) { return Math.floor(Math.random() * (n + 1)); }
function pick(arr) { return arr[rand(arr.length - 1)]; }

// Step magnitude 1-3, weighted so 1 is most common and 3 is rarest (weights 3:2:1).
function weightedMagnitude() {
  const r = Math.random();
  if (r < 0.5) return 1;
  if (r < 0.8333) return 2;
  return 3;
}

function emptyStats() {
  return {
    puttAttempts: 0, puttMakes: 0,
    approachAttempts: 0, approachMakes: 0,
    forehand: 0, forehandMakes: 0,
    backhand: 0, backhandMakes: 0,
    longestPutt: 0, longestApproach: 0,
    perksCount: 0,
  };
}

function emptyEffects() {
  return { forceHand: null, forceKnee: false, doublePoints: false, pushSteps: 0, immune: false, forceApproach: false, sabotageBy: null };
}

// Distance never moves randomly anymore — it moves deterministically based on the outcome
// of each throw: a hit pushes the player back (harder), a miss pulls them forward (easier).
// Step size depends on how far out they currently are.
const MIN_DISTANCE = 3;
function depthStepSize(distance) {
  return distance <= 10 ? 1 : 2 + rand(1); // 1 step at 4-10m, 2-3 steps beyond that
}

// Lateral (sideways) step: always 1-3, weighted toward 1, simulating real obstacles like trees.
function rollLateralStep(extra = 0) {
  const magnitude = weightedMagnitude() + extra;
  const sign = Math.random() < 0.5 ? -1 : 1;
  return magnitude * sign;
}

function StepMap() { return null; } // legacy placeholder, unused

// Solo Mode session history, kept in memory for this browser tab only (no persistent
// storage is used in artifacts). Resets on reload; full cross-visit history is a v2.0
// feature that requires an account.
let soloHistory = [];

// Explicit, spoken instruction for the physical steps to take before this throw.
function stepInstruction(lang, turn) {
  if (turn.dx === 0 && turn.dy === 0) return t(lang, "noStep");
  const s = STRINGS[lang];
  const parts = [];
  if (turn.dy !== 0) parts.push(`${Math.abs(turn.dy)} ${s.stepsWord} ${turn.dy > 0 ? s.back : s.forward}`);
  if (turn.dx !== 0) parts.push(`${Math.abs(turn.dx)} ${s.stepsWord} ${turn.dx > 0 ? s.right : s.left}`);
  return `${s.take} ` + parts.join(` ${s.andWord} `);
}

// Field map: basket fixed at the top ("norr"), players stand south (below) at a distance
// proportional to how far from the basket they are. All players are always visible in their
// own color; the active player is drawn sharp and large, others are dimmed but still legible.
function FieldMap({ players, turnIdx, maxDistance, lang, width = 260, height = 210 }) {
  const topPad = 26, bottomPad = 14, sidePad = 24;
  const usableH = height - topPad - bottomPad;
  const usableW = width - sidePad * 2;
  const lateralRange = 7;

  const toXY = (dx, dist) => {
    const x = width / 2 + (dx / lateralRange) * (usableW / 2);
    const y = topPad + (Math.min(dist, maxDistance) / maxDistance) * usableH;
    return [x, y];
  };

  const activeTrail = players[turnIdx]?.trail || [];
  const showLine = activeTrail.length >= 2;
  const linePath = activeTrail.map((p, i) => {
    const [x, y] = toXY(p.dx, p.distance);
    return `${i === 0 ? "M" : "L"}${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <rect x={sidePad} y={topPad} width={usableW} height={usableH} fill="none" stroke={T.surfaceLine} strokeWidth="1" rx="8" />
      <line x1={width / 2} y1={topPad} x2={width / 2} y2={topPad + usableH} stroke={T.surfaceLine} strokeWidth="1" strokeDasharray="2 5" />

      <g transform={`translate(${width / 2},${topPad})`}>
        <ellipse cx="0" cy="-9" rx="8" ry="2.5" fill="none" stroke={T.chain} strokeWidth="1.3" />
        <line x1="-6" y1="-9" x2="-2" y2="1" stroke={T.chain} strokeWidth="1" />
        <line x1="-3" y1="-9" x2="-1" y2="1" stroke={T.chain} strokeWidth="1" />
        <line x1="0" y1="-9" x2="0" y2="1" stroke={T.chain} strokeWidth="1" />
        <line x1="3" y1="-9" x2="1" y2="1" stroke={T.chain} strokeWidth="1" />
        <line x1="6" y1="-9" x2="2" y2="1" stroke={T.chain} strokeWidth="1" />
        <path d="M-7,1 L7,1 L5,7 L-5,7 Z" fill="none" stroke={T.chain} strokeWidth="1.3" />
        <line x1="0" y1="7" x2="0" y2="13" stroke={T.surfaceLine} strokeWidth="2" />
      </g>

      {showLine && <path d={linePath} fill="none" stroke={T.accent} strokeWidth="1.2" opacity="0.5" />}

      {players.map((p, i) => {
        const last = p.trail && p.trail.length ? p.trail[p.trail.length - 1] : { dx: 0, distance: p.distance };
        const [x, y] = toXY(last.dx, last.distance);
        const isActive = i === turnIdx;
        return (
          <g key={i} opacity={isActive ? 1 : 0.55}>
            <circle cx={x} cy={y} r={isActive ? 8 : 5} fill={p.color} stroke={isActive ? T.ink : "none"} strokeWidth={isActive ? 1.5 : 0} />
            <text
              x={x} y={y - (isActive ? 13 : 9)} textAnchor="middle"
              fontFamily={MONO_FONT} fontSize={isActive ? 10 : 8} fontWeight={isActive ? 700 : 400}
              fill={isActive ? p.color : T.inkDim}
            >
              {p.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        width: "100%", padding: "12px 14px", borderRadius: 10,
        background: T.surface, border: `1px solid ${T.surfaceLine}`,
        color: T.ink, fontFamily: BODY_FONT, fontSize: 14, cursor: "pointer",
      }}
    >
      <span>{label}</span>
      <span style={{
        width: 40, height: 22, borderRadius: 11, background: value ? T.accent : T.surfaceLine,
        position: "relative", transition: "background .15s",
      }}>
        <span style={{
          position: "absolute", top: 2, left: value ? 20 : 2, width: 18, height: 18,
          borderRadius: "50%", background: value ? T.accentInk : T.inkDim, transition: "left .15s",
        }} />
      </span>
    </button>
  );
}

function Pill({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 16px", borderRadius: 999, cursor: "pointer",
        fontFamily: BODY_FONT, fontWeight: 600, fontSize: 14,
        background: active ? T.accent : "transparent",
        color: active ? T.accentInk : T.ink,
        border: `1.5px solid ${active ? T.accent : T.surfaceLine}`,
      }}
    >
      {children}
    </button>
  );
}

export default function FriendsPage() {
  const router = useRouter();
  const [screen, setScreen] = useState("setup");
  const [accountUser, setAccountUser] = useState(undefined);
  const [language, setLanguage] = useState(detectLanguage);
  const [soloMode, setSoloMode] = useState(false);
  const [numPlayers, setNumPlayers] = useState(2);
  const [names, setNames] = useState(["Spelare 1", "Spelare 2"]);
  const [difficulty, setDifficulty] = useState("amateur");
  const [winScore, setWinScore] = useState(15);
  const [maxDistance, setMaxDistance] = useState(25);
  const [perksOn, setPerksOn] = useState(true);
  const [pressOn, setPressOn] = useState(true);
  const [challengeOn, setChallengeOn] = useState(true);

  const [players, setPlayers] = useState([]);
  const [turnIdx, setTurnIdx] = useState(0);
  const [turn, setTurn] = useState(null);
  const [winnerIdx, setWinnerIdx] = useState(null);
  const [pendingPerk, setPendingPerk] = useState(null);
  const [pendingSwap, setPendingSwap] = useState(null);
  const [pendingMulligan, setPendingMulligan] = useState(false);
  const [pendingChallenge, setPendingChallenge] = useState(null);
  const [lastPerkEvent, setLastPerkEvent] = useState(null);

  const diff = DIFFICULTIES[difficulty];

  // Kräv inloggning för Friends Mode, och lås Spelare 1:s namn till kontots identitet.
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user || null;
      setAccountUser(u);
      if (u) {
        const displayName = u.user_metadata?.display_name || u.email.split("@")[0];
        setNames((prev) => {
          const next = [...prev];
          next[0] = displayName;
          return next;
        });
      } else {
        router.push("/login");
      }
    });
  }, [router]);

  const updateNumPlayers = (n) => {
    const clamped = Math.max(2, Math.min(10, n));
    setNumPlayers(clamped);
    setNames((prev) => {
      const next = [...prev];
      while (next.length < clamped) next.push(`Spelare ${next.length + 1}`);
      return next.slice(0, clamped);
    });
  };

  const buildTurn = (player, allScores, isFirst) => {
    const s = scoreFor(player.distance);

    if (isFirst) {
      return {
        baseDistance: player.distance,
        effectiveDistance: player.distance,
        kind: s.kind,
        pointsIfHit: s.points,
        basePoints: s.points,
        doubled: false,
        approachForced: false,
        throwsNeeded: s.throws,
        throwsDone: 0,
        throwHits: 0,
        hand: diff.hands[0],
        knee: false,
        weakHand: false,
        dx: 0,
        dy: 0,
        press: null,
        sabotageBy: null,
      };
    }

    let hand = diff.hands.length > 1 ? pick(diff.hands) : diff.hands[0];
    let knee = diff.kneeAvailable && Math.random() < 0.3;
    const weakHand = diff.weakHandAvailable && Math.random() < 0.15;

    const eff = player.effects;
    if (eff.forceHand) hand = eff.forceHand;
    if (eff.forceKnee) knee = true;

    // The depth step shown here isn't random — it's the step the player already took
    // as a result of their last throw (back on a hit, forward on a miss). Distance
    // itself never jumps around randomly, so it can't creep past the basket.
    const dy = player.lastStepDelta || 0;
    const dx = rollLateralStep(eff.pushSteps || 0);
    const effectiveDistance = player.distance;

    let es = scoreFor(effectiveDistance);
    let approachForced = false;
    // A "force approach" effect always upgrades the next throw to a 2-throw approach,
    // regardless of current distance — a bonus/harder challenge, not a distance fix-up.
    if (eff.forceApproach && es.kind === "putt") {
      es = { points: 2, kind: "approach", throws: 2 };
      approachForced = true;
    }

    // Press: 1/10 chance of a bonus challenge announced before the throw (if enabled).
    // Press is a multiplayer surprise mechanic and is skipped entirely in Solo Mode.
    let press = null;
    if (!soloMode && pressOn && Math.random() < 0.1) {
      press = pick(getPressTypes(language));
    }

    return {
      baseDistance: player.distance,
      effectiveDistance,
      kind: es.kind,
      pointsIfHit: es.points * (eff.doublePoints ? 2 : 1),
      basePoints: es.points,
      doubled: eff.doublePoints,
      approachForced,
      throwsNeeded: es.throws,
      throwsDone: 0,
      throwHits: 0,
      hand, knee, weakHand, dx, dy, press,
      sabotageBy: eff.sabotageBy || null,
    };
  };

  const startMatch = () => {
    setSoloMode(false);
    const initial = names.map((n, i) => ({
      name: n, score: 0, distance: diff.start, stats: emptyStats(),
      color: PLAYER_COLORS[i % PLAYER_COLORS.length],
      trail: [{ dx: 0, distance: diff.start }],
      streak: 0, effects: emptyEffects(), mulligans: 0, worstDeficit: 0,
      bestStreak: 0, maxDistanceReached: diff.start, lastStepDelta: 0, throwLog: [],
    }));
    setWinnerIdx(null);
    setTurnIdx(0);
    setLastPerkEvent(null);
    setPendingChallenge(null);
    setScreen("match");
    const tn = buildTurn(initial[0], initial.map((p) => p.score), true);
    setPlayers(initial);
    setTurn(tn);
  };

  const startSoloMatch = () => {
    setSoloMode(true);
    const initial = [{
      name: t(language, "youLabel"), score: 0, distance: diff.start, stats: emptyStats(),
      color: PLAYER_COLORS[0],
      trail: [{ dx: 0, distance: diff.start }],
      streak: 0, effects: emptyEffects(), mulligans: 0, worstDeficit: 0,
      bestStreak: 0, maxDistanceReached: diff.start, lastStepDelta: 0, throwLog: [],
    }];
    setWinnerIdx(null);
    setTurnIdx(0);
    setLastPerkEvent(null);
    setPendingChallenge(null);
    setScreen("match");
    const tn = buildTurn(initial[0], initial.map((p) => p.score), true);
    setPlayers(initial);
    setTurn(tn);
  };

  const advanceTo = (nextIdx, currentPlayers) => {
    const leadScore = Math.max(...currentPlayers.map((p) => p.score));
    const deficit = currentPlayers[nextIdx].score - leadScore;
    const tn = buildTurn(currentPlayers[nextIdx], currentPlayers.map((p) => p.score), false);
    const next = [...currentPlayers];
    next[nextIdx] = {
      ...next[nextIdx],
      trail: [...next[nextIdx].trail, { dx: tn.dx, distance: tn.effectiveDistance }].slice(-24),
      effects: emptyEffects(),
      worstDeficit: Math.min(next[nextIdx].worstDeficit || 0, deficit),
    };
    setPlayers(next);
    setTurnIdx(nextIdx);
    setTurn(tn);
    setPendingChallenge(null);
  };

  const applyThrowResult = (hit) => {
    if (!turn) return;

    if (!hit && (players[turnIdx].mulligans || 0) > 0) {
      setPendingMulligan(true);
      return;
    }

    resolveThrow(hit);
  };

  const useMulligan = () => {
    setPlayers((prev) => {
      const next = [...prev];
      const p = { ...next[turnIdx] };
      p.mulligans = Math.max(0, (p.mulligans || 0) - 1);
      next[turnIdx] = p;
      return next;
    });
    setLastPerkEvent(t(language, "evMulliganUsed", { name: players[turnIdx].name }));
    setPendingMulligan(false);
  };

  const declineMulligan = () => {
    setPendingMulligan(false);
    resolveThrow(false);
  };

  const resolveThrow = (hit) => {
    const done = turn.throwsDone + 1;
    const hits = turn.throwHits + (hit ? 1 : 0);
    const finished = done >= turn.throwsNeeded;

    if (!finished) {
      setPlayers((prev) => {
        const next = [...prev];
        const p = { ...next[turnIdx] };
        p.throwLog = [...(p.throwLog || []), { hand: turn.hand, weakHand: turn.weakHand, distance: turn.effectiveDistance, hit }];
        next[turnIdx] = p;
        return next;
      });
      setTurn({ ...turn, throwsDone: done, throwHits: hits });
      return;
    }

    const allHit = hits === turn.throwsNeeded;
    let drawnPerk = null;

    let resolvedPlayers = (() => {
      const next = [...players];
      const p = { ...next[turnIdx] };
      const st = { ...p.stats };

      if (turn.kind === "putt") {
        st.puttAttempts += 1;
        if (allHit) { st.puttMakes += 1; if (turn.effectiveDistance > st.longestPutt) st.longestPutt = turn.effectiveDistance; }
      } else {
        st.approachAttempts += 1;
        if (allHit) { st.approachMakes += 1; if (turn.effectiveDistance > st.longestApproach) st.longestApproach = turn.effectiveDistance; }
      }
      if (turn.hand === "forehand") { st.forehand += 1; if (allHit) st.forehandMakes += 1; }
      else { st.backhand += 1; if (allHit) st.backhandMakes += 1; }

      p.stats = st;
      p.throwLog = [...(p.throwLog || []), { hand: turn.hand, weakHand: turn.weakHand, distance: turn.effectiveDistance, hit }];

      if (allHit) {
        p.score += turn.pointsIfHit + (turn.knee ? 1 : 0);
        p.streak = (p.streak || 0) + 1;
        p.bestStreak = Math.max(p.bestStreak || 0, p.streak);
        if (turn.press && turn.press.id === "mulligan") {
          p.mulligans = (p.mulligans || 0) + 1;
        }
        if (!soloMode && perksOn && p.streak > 0 && p.streak % 3 === 0) {
          const pool = getPerks(language);
          drawnPerk = pick(pool.filter((pk) => !pk.golden || Math.random() < 0.15));
        }
      } else {
        p.streak = 0;
      }

      // Distance always moves now: back (harder) on a hit, forward (easier) on a miss.
      // Step size depends on how far out the throw was taken from.
      const stepSize = depthStepSize(turn.baseDistance);
      p.distance = allHit
        ? Math.min(maxDistance, turn.baseDistance + stepSize)
        : Math.max(MIN_DISTANCE, turn.baseDistance - stepSize);
      p.lastStepDelta = p.distance - turn.baseDistance;
      p.maxDistanceReached = Math.max(p.maxDistanceReached || p.distance, p.distance);

      next[turnIdx] = p;
      return next;
    })();

    let eventMsgs = [];

    if (allHit && turn.press && turn.press.id === "kaos") {
      const dir = Math.random() < 0.5 ? 1 : -1;
      const mag = weightedMagnitude();
      resolvedPlayers = resolvedPlayers.map((pl) => ({
        ...pl,
        distance: Math.max(1, Math.min(maxDistance, pl.distance + dir * mag)),
      }));
      eventMsgs.push(t(language, "evKaos", { mag, dir: dir > 0 ? t(language, "dirBack") : t(language, "dirForward") }));
    } else if (allHit && turn.press && turn.press.id === "mulligan") {
      eventMsgs.push(t(language, "evMulliganWon", { name: resolvedPlayers[turnIdx].name }));
    } else if (allHit && turn.press && turn.press.id === "approach") {
      resolvedPlayers = resolvedPlayers.map((pl, i) =>
        i === turnIdx ? { ...pl, effects: { ...pl.effects, forceApproach: true } } : pl
      );
    }

    // Challenge: a bystander bet against (or for) this throw before it happened.
    if (pendingChallenge) {
      const challengerIdx = pendingChallenge.challengerIdx;
      resolvedPlayers = resolvedPlayers.map((pl, i) => {
        if (i !== challengerIdx) return pl;
        const delta = allHit ? -1 : 1;
        return { ...pl, score: Math.max(0, pl.score + delta) };
      });
      const challengerName = resolvedPlayers[challengerIdx].name;
      eventMsgs.push(allHit ? t(language, "evChallengeLose", { name: challengerName }) : t(language, "evChallengeWin", { name: challengerName }));
    }

    if (eventMsgs.length) setLastPerkEvent(eventMsgs.join(" "));
    setPendingChallenge(null);

    setPlayers(resolvedPlayers);
    setTurn(null);

    const winner = resolvedPlayers[turnIdx];
    if (winner.score >= winScore) {
      setWinnerIdx(turnIdx);
      if (soloMode) {
        const st = winner.stats;
        soloHistory.push({
          score: winner.score,
          puttPct: st.puttAttempts ? st.puttMakes / st.puttAttempts : 0,
          approachPct: st.approachAttempts ? st.approachMakes / st.approachAttempts : 0,
          longestPutt: st.longestPutt,
          longestApproach: st.longestApproach,
          bestStreak: winner.bestStreak || 0,
          highestDistance: winner.maxDistanceReached || winner.distance,
        });
        setScreen("soloResults");
      } else {
        setScreen("results");
      }
      return;
    }

    const nextIdx = (turnIdx + 1) % resolvedPlayers.length;

    if (allHit && turn.press && turn.press.id === "byt") {
      setPendingSwap({ drawerIdx: turnIdx, nextIdx });
      return;
    }

    if (drawnPerk) {
      setPendingPerk({ perk: drawnPerk, drawerIdx: turnIdx, nextIdx });
    } else {
      advanceTo(nextIdx, resolvedPlayers);
    }
  };

  const resolvePerk = (targetIdx) => {
    if (!pendingPerk) return;
    const { perk, drawerIdx, nextIdx } = pendingPerk;
    const next = players.map((p) => ({ ...p, effects: { ...p.effects } }));
    const target = next[targetIdx];

    if (perk.negative && target.effects.immune) {
      target.effects = emptyEffects();
      setLastPerkEvent(t(language, "evImmuneBlocked", { target: target.name, perk: perk.label }));
    } else if (perk.id === "steal") {
      const drawer = next[drawerIdx];
      const stolen = Math.min(1, target.score);
      target.score -= stolen;
      drawer.score += stolen;
      setLastPerkEvent(t(language, "evStolePoints", { drawer: drawer.name, amount: stolen, target: target.name }));
    } else {
      const eff = emptyEffects();
      if (perk.id === "double") eff.doublePoints = true;
      if (perk.id === "forceForehand") eff.forceHand = "forehand";
      if (perk.id === "forceBackhand") eff.forceHand = "backhand";
      if (perk.id === "forceKnee") eff.forceKnee = true;
      if (perk.id === "pushSteps") eff.pushSteps = 2;
      if (perk.id === "immune") eff.immune = true;
      if (perk.id === "approach") eff.forceApproach = true;
      if (perk.id === "sabotage") eff.sabotageBy = next[drawerIdx].name;
      target.effects = eff;
      target.stats = { ...target.stats, perksCount: (target.stats.perksCount || 0) + 1 };
      setLastPerkEvent(t(language, "evPerkGiven", { target: target.name, perk: perk.label }));
    }

    setPendingPerk(null);
    advanceTo(nextIdx, next);
  };

  const resolveSwap = (targetIdx) => {
    if (!pendingSwap) return;
    const { drawerIdx, nextIdx } = pendingSwap;
    const next = players.map((p) => ({ ...p }));
    const a = next[drawerIdx];
    const b = next[targetIdx];
    const tmp = a.distance;
    a.distance = b.distance;
    b.distance = tmp;
    const aLastDx = a.trail[a.trail.length - 1]?.dx || 0;
    const bLastDx = b.trail[b.trail.length - 1]?.dx || 0;
    a.trail = [...a.trail, { dx: aLastDx, distance: a.distance }].slice(-24);
    b.trail = [...b.trail, { dx: bLastDx, distance: b.distance }].slice(-24);
    setLastPerkEvent(t(language, "evSwap", { a: a.name, b: b.name }));
    setPlayers(next);
    setPendingSwap(null);
    advanceTo(nextIdx, next);
  };

  const resetAll = () => {
    setScreen("setup");
    setSoloMode(false);
    setPlayers([]);
    setTurn(null);
    setWinnerIdx(null);
    setPendingPerk(null);
    setPendingSwap(null);
    setPendingMulligan(false);
    setPendingChallenge(null);
    setLastPerkEvent(null);
  };

  const replaySolo = () => {
    setWinnerIdx(null);
    setPendingPerk(null);
    setPendingSwap(null);
    setPendingMulligan(false);
    setPendingChallenge(null);
    setLastPerkEvent(null);
    startSoloMatch();
  };

  const currentPlayer = players[turnIdx];

  if (accountUser === undefined) {
    return (
      <div style={{
        minHeight: "100vh", background: T.bg, color: T.inkDim, display: "flex",
        alignItems: "center", justifyContent: "center", fontFamily: BODY_FONT,
      }}>
        Laddar…
      </div>
    );
  }
  if (accountUser === null) {
    return null; // redirect till /login pågår
  }

  return (
    <div style={{
      minHeight: "100vh", background: `radial-gradient(circle at 50% -10%, ${T.bg2}, ${T.bg} 60%)`,
      color: T.ink, fontFamily: BODY_FONT, display: "flex", justifyContent: "center",
      padding: "24px 16px", boxSizing: "border-box",
    }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <Header screen={screen} onReset={resetAll} lang={language} />

        {screen === "setup" && (
          <SetupScreen
            lang={language}
            numPlayers={numPlayers} updateNumPlayers={updateNumPlayers}
            names={names} setNames={setNames}
            difficulty={difficulty} setDifficulty={setDifficulty}
            winScore={winScore} setWinScore={setWinScore}
            maxDistance={maxDistance} setMaxDistance={setMaxDistance}
            perksOn={perksOn} setPerksOn={setPerksOn}
            pressOn={pressOn} setPressOn={setPressOn}
            challengeOn={challengeOn} setChallengeOn={setChallengeOn}
            onStart={startMatch}
            onShowRules={() => setScreen("rules")}
            onBack={() => router.push("/")}
            lockedFirstName
          />
        )}

        {screen === "rules" && (
          <RulesScreen lang={language} onBack={() => setScreen("setup")} />
        )}

        {screen === "match" && currentPlayer && turn && !pendingPerk && !pendingSwap && (
          <MatchScreen
            lang={language}
            players={players} turnIdx={turnIdx} turn={turn}
            currentPlayer={currentPlayer}
            onResult={applyThrowResult}
            lastPerkEvent={lastPerkEvent}
            maxDistance={maxDistance}
            pendingMulligan={pendingMulligan}
            onUseMulligan={useMulligan}
            onDeclineMulligan={declineMulligan}
            pendingChallenge={pendingChallenge}
            onSetChallenge={(idx) => setPendingChallenge({ challengerIdx: idx })}
            challengeOn={challengeOn}
          />
        )}

        {screen === "match" && pendingPerk && (
          <PerkModal lang={language} players={players} pendingPerk={pendingPerk} onResolve={resolvePerk} />
        )}

        {screen === "match" && pendingSwap && (
          <SwapModal lang={language} players={players} pendingSwap={pendingSwap} onResolve={resolveSwap} />
        )}

        {screen === "results" && winnerIdx !== null && (
          <ResultsScreen lang={language} players={players} winnerIdx={winnerIdx} onReplay={resetAll} />
        )}

        {screen === "soloResults" && winnerIdx !== null && (
          <SoloResultsScreen lang={language} player={players[winnerIdx]} onReplay={replaySolo} onHome={resetAll} />
        )}
      </div>
    </div>
  );
}

function Header({ screen, onReset, lang }) {
  return (
    <div style={{ marginBottom: 20, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
      <div>
        <div style={{ fontFamily: DISPLAY_FONT, fontSize: 26, letterSpacing: 0.5, color: T.ink }}>
          PUTT <span style={{ color: T.accent }}>BATTLE</span>
        </div>
        <div style={{ fontFamily: MONO_FONT, fontSize: 11, color: T.inkDim, marginTop: 2 }}>
          {t(lang, "tagline")}
        </div>
      </div>
      {(screen === "match" || screen === "results" || screen === "soloResults") && (
        <button onClick={onReset} style={{
          background: "none", border: `1px solid ${T.surfaceLine}`, borderRadius: 8,
          color: T.inkDim, padding: "6px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
          fontFamily: BODY_FONT, fontSize: 12,
        }}>
          <RotateCcw size={13} /> {t(lang, "newMatch")}
        </button>
      )}
    </div>
  );
}

function SetupScreen({ lang, numPlayers, updateNumPlayers, names, setNames, difficulty, setDifficulty, winScore, setWinScore, maxDistance, setMaxDistance, perksOn, setPerksOn, pressOn, setPressOn, challengeOn, setChallengeOn, onStart, onShowRules, onBack, lockedFirstName }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <button onClick={onBack} style={{
        alignSelf: "flex-start", background: "none", border: "none", color: T.inkDim,
        cursor: "pointer", fontFamily: BODY_FONT, fontSize: 13, padding: 0,
      }}>
        {STRINGS[lang].backToStart}
      </button>

      <Section title={STRINGS[lang].sectionPlayers}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <RoundBtn onClick={() => updateNumPlayers(numPlayers - 1)}><Minus size={16} /></RoundBtn>
          <div style={{ fontFamily: DISPLAY_FONT, fontSize: 22, minWidth: 28, textAlign: "center" }}>{numPlayers}</div>
          <RoundBtn onClick={() => updateNumPlayers(numPlayers + 1)}><Plus size={16} /></RoundBtn>
          <span style={{ color: T.inkDim, fontSize: 13 }}>{STRINGS[lang].playersSuffix}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {names.map((n, i) => {
            const locked = lockedFirstName && i === 0;
            return (
              <input
                key={i}
                value={n}
                readOnly={locked}
                onChange={(e) => {
                  if (locked) return;
                  setNames((prev) => { const c = [...prev]; c[i] = e.target.value; return c; });
                }}
                style={{
                  background: locked ? T.bg2 : T.surface,
                  border: `1px solid ${locked ? T.accent : T.surfaceLine}`, borderRadius: 8,
                  padding: "10px 12px", color: T.ink, fontFamily: BODY_FONT, fontSize: 14,
                  cursor: locked ? "not-allowed" : "text",
                }}
              />
            );
          })}
        </div>
      </Section>

      <Section title={STRINGS[lang].sectionDifficulty}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {Object.entries(DIFFICULTIES).map(([key, d]) => (
            <Pill key={key} active={difficulty === key} onClick={() => setDifficulty(key)}>{STRINGS[lang][d.key]}</Pill>
          ))}
        </div>
      </Section>

      <Section title={STRINGS[lang].sectionWinScore}>
        <div style={{ display: "flex", gap: 8 }}>
          {[10, 15, 20, 30].map((v) => (
            <Pill key={v} active={winScore === v} onClick={() => setWinScore(v)}>{v}</Pill>
          ))}
        </div>
      </Section>

      <Section title={STRINGS[lang].sectionMaxDistance}>
        <div style={{ display: "flex", gap: 8 }}>
          {[20, 25, 30].map((v) => (
            <Pill key={v} active={maxDistance === v} onClick={() => setMaxDistance(v)}>{v} m</Pill>
          ))}
        </div>
      </Section>

      <Section title="">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Toggle label={STRINGS[lang].sectionPerks} value={perksOn} onChange={setPerksOn} />
          <Toggle label={STRINGS[lang].sectionPress} value={pressOn} onChange={setPressOn} />
          <Toggle label={STRINGS[lang].sectionChallenge} value={challengeOn} onChange={setChallengeOn} />
        </div>
      </Section>

      <Section title={STRINGS[lang].sectionBeforeStart}>
        <div style={{
          background: T.surface, border: `1px solid ${T.surfaceLine}`, borderRadius: 10,
          padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6,
        }}>
          <div style={{ fontSize: 13, color: T.ink, lineHeight: 1.5 }}>
            {STRINGS[lang].onboardingMarker}
          </div>
        </div>
      </Section>

      <button onClick={onShowRules} style={{
        background: "none", border: `1px solid ${T.surfaceLine}`, borderRadius: 10,
        color: T.inkDim, padding: "10px", cursor: "pointer", fontFamily: BODY_FONT, fontSize: 13,
      }}>
        {STRINGS[lang].rulesLink}
      </button>

      <button onClick={onStart} style={{
        marginTop: 8, padding: "16px", borderRadius: 12, border: "none", cursor: "pointer",
        background: T.accent, color: T.accentInk, fontFamily: DISPLAY_FONT, fontSize: 18,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      }}>
        {STRINGS[lang].startMatch} <ChevronRight size={20} />
      </button>
    </div>
  );
}

function StartScreen({ lang, setLanguage, onPlayFriends, onPlaySolo }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, alignItems: "center" }}>
      <img
        src={LOGO_DATA_URI}
        alt="Putt Battle"
        style={{ width: 200, height: 200, borderRadius: 32 }}
      />

      <div style={{ display: "flex", gap: 8 }}>
        {LANGUAGES.map((code) => (
          <Pill key={code} active={lang === code} onClick={() => setLanguage(code)}>{LANG_LABEL[code]}</Pill>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%", marginTop: 8 }}>
        <button onClick={onPlayFriends} style={{
          padding: "22px", borderRadius: 16, border: "none", cursor: "pointer",
          background: T.accent, color: T.accentInk, fontFamily: DISPLAY_FONT, fontSize: 20,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        }}>
          {STRINGS[lang].startPlayFriends}
        </button>
        <button onClick={onPlaySolo} style={{
          padding: "22px", borderRadius: 16, cursor: "pointer",
          background: "transparent", color: T.ink, border: `2px solid ${T.surfaceLine}`,
          fontFamily: DISPLAY_FONT, fontSize: 20,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        }}>
          {STRINGS[lang].startPlaySolo}
        </button>
      </div>

      <a
        href={PRIVACY_FILES[lang] || PRIVACY_FILES.swe}
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontSize: 12, color: "#999", textDecoration: "underline", marginTop: 8 }}
      >
        {STRINGS[lang].privacyPolicyLabel}
      </a>
    </div>
  );
}

function SoloSetupScreen({ lang, difficulty, setDifficulty, winScore, setWinScore, maxDistance, setMaxDistance, onStart, onShowRules, onBack }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <button onClick={onBack} style={{
        alignSelf: "flex-start", background: "none", border: "none", color: T.inkDim,
        cursor: "pointer", fontFamily: BODY_FONT, fontSize: 13, padding: 0,
      }}>
        {STRINGS[lang].backToStart}
      </button>

      <Section title={STRINGS[lang].sectionDifficulty}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {Object.entries(DIFFICULTIES).map(([key, d]) => (
            <Pill key={key} active={difficulty === key} onClick={() => setDifficulty(key)}>{STRINGS[lang][d.key]}</Pill>
          ))}
        </div>
      </Section>

      <Section title={STRINGS[lang].sectionWinScore}>
        <div style={{ display: "flex", gap: 8 }}>
          {[10, 15, 20, 30].map((v) => (
            <Pill key={v} active={winScore === v} onClick={() => setWinScore(v)}>{v}</Pill>
          ))}
        </div>
      </Section>

      <Section title={STRINGS[lang].sectionMaxDistance}>
        <div style={{ display: "flex", gap: 8 }}>
          {[20, 25, 30].map((v) => (
            <Pill key={v} active={maxDistance === v} onClick={() => setMaxDistance(v)}>{v} m</Pill>
          ))}
        </div>
      </Section>

      <button onClick={onShowRules} style={{
        background: "none", border: `1px solid ${T.surfaceLine}`, borderRadius: 10,
        color: T.inkDim, padding: "10px", cursor: "pointer", fontFamily: BODY_FONT, fontSize: 13,
      }}>
        {STRINGS[lang].rulesLink}
      </button>

      <button onClick={onStart} style={{
        marginTop: 8, padding: "16px", borderRadius: 12, border: "none", cursor: "pointer",
        background: T.accent, color: T.accentInk, fontFamily: DISPLAY_FONT, fontSize: 18,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      }}>
        {STRINGS[lang].startMatch} <ChevronRight size={20} />
      </button>
    </div>
  );
}

function SoloResultsScreen({ lang, player, onReplay, onHome }) {
  const s = STRINGS[lang];
  const st = player.stats;
  const totalAttempts = st.puttAttempts + st.approachAttempts;
  const totalMakes = st.puttMakes + st.approachMakes;

  // soloHistory already includes the just-finished session (pushed in resolveThrow).
  const allTime = {
    highScore: Math.max(...soloHistory.map((h) => h.score)),
    bestStreak: Math.max(...soloHistory.map((h) => h.bestStreak)),
    puttPct: Math.max(...soloHistory.map((h) => h.puttPct)),
    longestPutt: Math.max(...soloHistory.map((h) => h.longestPutt)),
    longestApproach: Math.max(...soloHistory.map((h) => h.longestApproach)),
    highestDistance: Math.max(...soloHistory.map((h) => h.highestDistance)),
  };
  const thisSession = soloHistory[soloHistory.length - 1];
  const isNew = (key, val) => allTime[key] === val && val > 0;

  const records = [
    [s.recHighScore, player.score, isNew("highScore", player.score)],
    [s.recBestStreak, player.bestStreak || 0, isNew("bestStreak", player.bestStreak || 0)],
    [s.recPuttPct, `${Math.round((thisSession.puttPct || 0) * 100)}%`, isNew("puttPct", thisSession.puttPct)],
    [s.recLongestPutt, st.longestPutt ? `${st.longestPutt}m` : "–", isNew("longestPutt", st.longestPutt)],
    [s.recLongestApproach, st.longestApproach ? `${st.longestApproach}m` : "–", isNew("longestApproach", st.longestApproach)],
    [s.recHighestDistance, `${player.maxDistanceReached || player.distance}m`, isNew("highestDistance", player.maxDistanceReached || player.distance)],
  ];

  const items = [
    [s.statHit, pct(totalMakes, totalAttempts)],
    [s.statPutt, pct(st.puttMakes, st.puttAttempts)],
    [s.statApproach, pct(st.approachMakes, st.approachAttempts)],
    [s.statForehand, pct(st.forehandMakes, st.forehand)],
    [s.statBackhand, pct(st.backhandMakes, st.backhand)],
    [s.statLongestPutt, st.longestPutt ? `${st.longestPutt}m` : "–"],
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ textAlign: "center", padding: "16px 0" }}>
        <div style={{ fontFamily: MONO_FONT, fontSize: 11, color: T.inkDim, textTransform: "uppercase" }}>{s.soloResultsTitle}</div>
        <div style={{ fontFamily: MONO_FONT, fontSize: 11, color: T.inkDim, marginTop: 10 }}>{s.finalScoreLabel}</div>
        <div style={{ fontFamily: DISPLAY_FONT, fontSize: 52, color: T.accent }}>{player.score}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, fontFamily: MONO_FONT }}>
        {items.map(([label, val]) => (
          <div key={label} style={{ background: T.bg2, borderRadius: 8, padding: "8px 6px", textAlign: "center" }}>
            <div style={{ fontSize: 15, color: T.chain }}>{val}</div>
            <div style={{ fontSize: 9, color: T.inkDim, marginTop: 2, textTransform: "uppercase" }}>{label}</div>
          </div>
        ))}
      </div>

      <ThrowBreakdown lang={lang} throwLog={player.throwLog} />
      <Section title={STRINGS[lang].personalRecordsTitle}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {records.map(([label, val, isNewRec]) => (
            <div key={label} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              background: T.surface, border: `1px solid ${isNewRec ? T.accent : T.surfaceLine}`, borderRadius: 10, padding: "10px 14px",
            }}>
              <div style={{ fontSize: 13, color: T.ink }}>{label}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {isNewRec && <span style={{ fontSize: 11, color: T.accent, fontFamily: MONO_FONT }}>{s.newRecordBadge}</span>}
                <span style={{ fontFamily: DISPLAY_FONT, fontSize: 16, color: T.accent }}>{val}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <div style={{ fontSize: 11, color: T.inkDim, textAlign: "center" }}>
        {t(lang, "sessionsPlayedLabel")}: {soloHistory.length}
      </div>
      <div style={{ fontSize: 11, color: T.inkDim, lineHeight: 1.5, textAlign: "center" }}>
        {s.noHistoryNote}
      </div>

      <button onClick={onReplay} style={{
        padding: "16px", borderRadius: 12, border: "none", cursor: "pointer",
        background: T.accent, color: T.accentInk, fontFamily: DISPLAY_FONT, fontSize: 16,
      }}>
        {s.playAgainSolo}
      </button>
      <button onClick={onHome} style={{
        padding: "14px", borderRadius: 12, cursor: "pointer",
        background: "none", border: `1px solid ${T.surfaceLine}`, color: T.ink,
        fontFamily: DISPLAY_FONT, fontSize: 14,
      }}>
        {s.toStartScreen}
      </button>
    </div>
  );
}

function RulesSection({ title, paragraphs, list, closing }) {
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.surfaceLine}`, borderRadius: 10,
      padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6,
    }}>
      <div style={{ fontFamily: DISPLAY_FONT, fontSize: 15, color: T.accent }}>{title}</div>
      {(paragraphs || []).map((p, i) => (
        <div key={i} style={{ fontSize: 13, color: T.inkDim, lineHeight: 1.5 }}>{p}</div>
      ))}
      {list && (
        <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 2 }}>
          {list.items.map((item, i) => (
            <div key={i} style={{ fontSize: 13, color: T.inkDim, lineHeight: 1.5 }}>
              {list.ordered ? `${i + 1}. ` : "• "}{item}
            </div>
          ))}
        </div>
      )}
      {closing && (
        <div style={{ fontSize: 13, color: T.ink, fontWeight: 600, marginTop: 2 }}>{closing}</div>
      )}
    </div>
  );
}

function RulesScreen({ lang, onBack }) {
  const s = STRINGS[lang];
  const sections = [
    { title: s.objectiveTitle, paragraphs: [s.objectiveDesc] },
    { title: s.howToPlayTitle, list: { ordered: true, items: s.howToPlaySteps }, closing: s.howToPlayClosing },
    { title: s.scoringTitle, list: { ordered: false, items: s.scoringItems } },
    { title: s.sectionPerks, paragraphs: [s.perksIntroDesc, s.perksPhilosophy, s.rulesPerksDesc] },
    { title: s.sectionPress, paragraphs: [s.rulesPressDesc] },
    { title: s.sectionChallenge, paragraphs: [s.rulesChallengeDesc] },
    { title: s.fairPlayTitle, paragraphs: [s.fairPlayIntro, s.fairPlayNoReferees], list: { ordered: false, items: s.fairPlayItems }, closing: s.fairPlayClosing },
    { title: s.rulesStepsTitle, paragraphs: [s.mechanicsHint] },
    { title: s.mostImportantTitle, paragraphs: [s.mostImportantDesc] },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ fontFamily: DISPLAY_FONT, fontSize: 22 }}>{s.rulesTitle}</div>
      {sections.map((sec, i) => (
        <RulesSection key={i} title={sec.title} paragraphs={sec.paragraphs} list={sec.list} closing={sec.closing} />
      ))}
      <button onClick={onBack} style={{
        background: "none", border: `1px solid ${T.surfaceLine}`, borderRadius: 10,
        color: T.ink, padding: "12px", cursor: "pointer", fontFamily: BODY_FONT, fontWeight: 600, fontSize: 14,
      }}>
        {s.backButton}
      </button>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <div style={{ fontFamily: MONO_FONT, fontSize: 11, color: T.inkDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function RoundBtn({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: 34, height: 34, borderRadius: "50%", border: `1px solid ${T.surfaceLine}`,
      background: T.surface, color: T.ink, cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {children}
    </button>
  );
}

function MatchScreen({ lang, players, turnIdx, turn, currentPlayer, onResult, lastPerkEvent, maxDistance, pendingMulligan, onUseMulligan, onDeclineMulligan, pendingChallenge, onSetChallenge, challengeOn }) {
  const [showChallengePicker, setShowChallengePicker] = useState(false);
  const throwLeft = turn.throwsNeeded - turn.throwsDone;
  const handLabel = turn.hand === "forehand" ? STRINGS[lang].statForehand : STRINGS[lang].statBackhand;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
        {players.map((p, i) => (
          <div key={i} style={{
            flex: "0 0 auto", minWidth: 88, padding: "8px 10px", borderRadius: 10,
            background: i === turnIdx ? T.accent : T.surface,
            border: `1px solid ${i === turnIdx ? T.accent : T.surfaceLine}`,
            color: i === turnIdx ? T.accentInk : T.ink,
          }}>
            <div style={{ fontSize: 11, fontFamily: MONO_FONT, opacity: 0.8, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: p.color, display: "inline-block", flexShrink: 0 }} />
              {p.name} {p.effects?.immune && <Shield size={10} />} {p.mulligans > 0 && `🔁${p.mulligans}`}
            </div>
            <div style={{ fontFamily: DISPLAY_FONT, fontSize: 22 }}>{p.score}</div>
          </div>
        ))}
      </div>

      {lastPerkEvent && (
        <div style={{
          background: T.bg2, border: `1px solid ${T.gold}`, borderRadius: 10, padding: "8px 12px",
          fontSize: 12, color: T.gold, display: "flex", alignItems: "center", gap: 6,
        }}>
          <Sparkles size={13} /> {lastPerkEvent}
        </div>
      )}

      {/* The spelledare voice: big, shouted, one thing at a time */}
      <div style={{ textAlign: "center", padding: "6px 0" }}>
        <div style={{ fontFamily: DISPLAY_FONT, fontSize: 40, lineHeight: 1.05, color: currentPlayer.color }}>
          {currentPlayer.name.toUpperCase()}!
        </div>
        <div style={{ fontFamily: DISPLAY_FONT, fontSize: 26, color: T.accent, marginTop: 4 }}>
          {handLabel.toUpperCase()}!
        </div>
        <div style={{ fontFamily: DISPLAY_FONT, fontSize: 22, color: T.ink, marginTop: 4 }}>
          {stepInstruction(lang, turn).toUpperCase()}
        </div>
        {turn.sabotageBy && (
          <div style={{ fontFamily: DISPLAY_FONT, fontSize: 18, color: T.press, marginTop: 4 }}>
            {t(lang, "sabotageTag", { name: turn.sabotageBy }).toUpperCase()}!
          </div>
        )}
      </div>

      <div style={{ background: T.surface, border: `1px solid ${T.surfaceLine}`, borderRadius: 16, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: MONO_FONT, fontSize: 11, color: T.inkDim, textTransform: "uppercase" }}>{t(lang, "nowThrowing")}</div>
            <div style={{ fontFamily: DISPLAY_FONT, fontSize: 18, color: currentPlayer.color }}>{currentPlayer.name}</div>
            <div style={{ fontFamily: MONO_FONT, fontSize: 10, color: T.inkDim, marginTop: 2 }}>
              {t(lang, "streakLabel", { n: currentPlayer.streak || 0 })}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: MONO_FONT, fontSize: 11, color: T.inkDim }}>{t(lang, "distanceLabel")}</div>
            <div style={{ fontFamily: DISPLAY_FONT, fontSize: 20, color: T.accent }}>{turn.effectiveDistance}m</div>
            {turn.effectiveDistance !== turn.baseDistance && (
              <div style={{ fontFamily: MONO_FONT, fontSize: 10, color: T.inkDim }}>
                {t(lang, "baseDistanceNote", { base: turn.baseDistance, sign: turn.dy < 0 ? t(lang, "signForward") : t(lang, "signBack") })}
              </div>
            )}
          </div>
        </div>

        {turn.press && (
          <div style={{
            margin: "14px 0 0", padding: "10px 14px", borderRadius: 10,
            background: T.bg2, border: `1px solid ${T.press}`,
          }}>
            <div style={{ fontFamily: MONO_FONT, fontSize: 11, color: T.press, textTransform: "uppercase", marginBottom: 2 }}>
              {t(lang, "pressPrefix", { label: turn.press.label })}
            </div>
            <div style={{ fontSize: 13, color: T.ink }}>{turn.press.desc}</div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "center", margin: "12px 0" }}>
          <FieldMap players={players} turnIdx={turnIdx} maxDistance={maxDistance} lang={lang} />
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 8 }}>
          <Tag>{handLabel}</Tag>
          {turn.knee && <Tag accent>{t(lang, "tagKnee")}</Tag>}
          {turn.weakHand && <Tag accent>{t(lang, "tagWeakHand")}</Tag>}
          {turn.doubled && <Tag accent>{t(lang, "tagDoublePoints")}</Tag>}
          {turn.approachForced && <Tag accent>{t(lang, "tagApproachForced")}</Tag>}
          {turn.sabotageBy && <Tag accent>{t(lang, "sabotageTag", { name: turn.sabotageBy })}</Tag>}
          {turn.kind === "approach" && <Tag>{t(lang, "tagApproach", { n: turn.throwsNeeded })}</Tag>}
        </div>

        {turn.kind === "approach" && (
          <div style={{ textAlign: "center", fontFamily: MONO_FONT, fontSize: 12, color: T.inkDim, marginBottom: 4 }}>
            {t(lang, "throwProgress", { done: turn.throwsDone + 1, needed: turn.throwsNeeded, left: throwLeft })}
          </div>
        )}
      </div>

      {/* Challenge: a bystander can bet on this throw before the result is registered */}
      {challengeOn && players.length > 1 && !pendingMulligan && (
        pendingChallenge ? (
          <div style={{
            textAlign: "center", padding: "8px 12px", borderRadius: 10,
            background: T.bg2, border: `1px solid ${T.press}`, color: T.press,
            fontFamily: DISPLAY_FONT, fontSize: 14,
          }}>
            {t(lang, "challengeBadge", { name: players[pendingChallenge.challengerIdx].name })}
          </div>
        ) : showChallengePicker ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontFamily: MONO_FONT, fontSize: 11, color: T.inkDim, textAlign: "center" }}>
              {t(lang, "challengeWho", { name: currentPlayer.name })}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              {players.map((p, i) => i !== turnIdx && (
                <button key={i} onClick={() => { onSetChallenge(i); setShowChallengePicker(false); }} style={{
                  padding: "8px 14px", borderRadius: 999, cursor: "pointer",
                  background: T.bg2, color: T.ink, border: `1px solid ${T.surfaceLine}`,
                  fontFamily: BODY_FONT, fontWeight: 600, fontSize: 13,
                }}>
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <button onClick={() => setShowChallengePicker(true)} style={{
            alignSelf: "center", padding: "8px 16px", borderRadius: 999, cursor: "pointer",
            background: "transparent", color: T.press, border: `1px solid ${T.press}`,
            fontFamily: BODY_FONT, fontWeight: 700, fontSize: 13,
          }}>
            {t(lang, "challengeButton")}
          </button>
        )
      )}

      {pendingMulligan ? (
        <div style={{
          background: T.surface, border: `1.5px solid ${T.press}`, borderRadius: 14,
          padding: 16, display: "flex", flexDirection: "column", gap: 10,
        }}>
          <div style={{ fontFamily: DISPLAY_FONT, fontSize: 17, color: T.press }}>{t(lang, "missedTitle")}</div>
          <div style={{ fontSize: 13, color: T.inkDim }}>{t(lang, "mulliganPrompt")}</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onDeclineMulligan} style={{
              flex: 1, padding: "12px 0", borderRadius: 10, cursor: "pointer",
              background: "transparent", color: T.inkDim, border: `1px solid ${T.surfaceLine}`,
              fontFamily: BODY_FONT, fontWeight: 600, fontSize: 14,
            }}>
              {t(lang, "mulliganDecline")}
            </button>
            <button onClick={onUseMulligan} style={{
              flex: 1, padding: "12px 0", borderRadius: 10, cursor: "pointer", border: "none",
              background: T.press, color: T.accentInk, fontFamily: BODY_FONT, fontWeight: 700, fontSize: 14,
            }}>
              {t(lang, "mulliganUse")}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => onResult(false)} style={{
            flex: 1, padding: "20px 0", borderRadius: 14, cursor: "pointer",
            background: "transparent", color: T.bad,
            border: `2px solid ${T.bad}`,
            fontFamily: DISPLAY_FONT, fontSize: 18,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
          }}>
            <X size={26} /> {t(lang, "missButton")}
          </button>
          <button onClick={() => onResult(true)} style={{
            flex: 1, padding: "20px 0", borderRadius: 14, border: "none", cursor: "pointer",
            background: T.good, color: T.accentInk, fontFamily: DISPLAY_FONT, fontSize: 18,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
          }}>
            <Check size={26} /> {t(lang, "hitButton")}
          </button>
        </div>
      )}
    </div>
  );
}


function PerkModal({ lang, players, pendingPerk, onResolve }) {
  const { perk, drawerIdx } = pendingPerk;
  const drawer = players[drawerIdx];
  return (
    <div style={{
      background: T.surface, border: `1.5px solid ${perk.golden ? T.gold : T.accent}`,
      borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 14,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Sparkles size={18} color={perk.golden ? T.gold : T.accent} />
        <div style={{ fontFamily: MONO_FONT, fontSize: 11, color: T.inkDim, textTransform: "uppercase" }}>
          {perk.golden ? t(lang, "perkGolden") : t(lang, "perkNormal")} · {t(lang, "perkStreakSuffix", { name: drawer.name })}
        </div>
      </div>
      <div>
        <div style={{ fontFamily: DISPLAY_FONT, fontSize: 22 }}>{perk.label}</div>
        <div style={{ color: T.inkDim, fontSize: 13, marginTop: 4 }}>{perk.desc}</div>
      </div>
      <div style={{ fontFamily: MONO_FONT, fontSize: 11, color: T.inkDim, marginTop: 4 }}>
        {t(lang, "publikrostPrefix")}{t(lang, "perkWhoGets")}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <button
          onClick={() => onResolve(drawerIdx)}
          style={{
            padding: "12px 14px", borderRadius: 10, border: `1px solid ${T.accent}`,
            background: "transparent", color: T.accent, fontFamily: BODY_FONT, fontWeight: 600,
            fontSize: 14, cursor: "pointer", textAlign: "left",
          }}
        >
          {t(lang, "perkUseSelf", { name: drawer.name })}
        </button>
        {players.map((p, i) => i !== drawerIdx && (
          <button
            key={i}
            onClick={() => onResolve(i)}
            style={{
              padding: "12px 14px", borderRadius: 10, border: `1px solid ${T.surfaceLine}`,
              background: T.bg2, color: T.ink, fontFamily: BODY_FONT, fontWeight: 600,
              fontSize: 14, cursor: "pointer", textAlign: "left",
            }}
          >
            {t(lang, "perkGiveTo", { name: p.name })}
          </button>
        ))}
      </div>
    </div>
  );
}

function SwapModal({ lang, players, pendingSwap, onResolve }) {
  const { drawerIdx } = pendingSwap;
  const drawer = players[drawerIdx];
  return (
    <div style={{
      background: T.surface, border: `1.5px solid ${T.press}`,
      borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 14,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Sparkles size={18} color={T.press} />
        <div style={{ fontFamily: MONO_FONT, fontSize: 11, color: T.inkDim, textTransform: "uppercase" }}>
          {t(lang, "swapKicker", { name: drawer.name })}
        </div>
      </div>
      <div style={{ fontFamily: DISPLAY_FONT, fontSize: 20 }}>{t(lang, "publikrostPrefix")}{t(lang, "swapQuestion")}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {players.map((p, i) => i !== drawerIdx && (
          <button
            key={i}
            onClick={() => onResolve(i)}
            style={{
              padding: "12px 14px", borderRadius: 10, border: `1px solid ${T.surfaceLine}`,
              background: T.bg2, color: T.ink, fontFamily: BODY_FONT, fontWeight: 600,
              fontSize: 14, cursor: "pointer", textAlign: "left",
              display: "flex", justifyContent: "space-between",
            }}
          >
            <span>{t(lang, "swapWith", { name: p.name })}</span>
            <span style={{ color: T.inkDim }}>{p.distance}m</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Tag({ children, accent }) {
  return (
    <span style={{
      padding: "5px 10px", borderRadius: 999, fontSize: 12, fontFamily: BODY_FONT, fontWeight: 600,
      background: accent ? T.accent : T.bg2, color: accent ? T.accentInk : T.inkDim,
      border: `1px solid ${accent ? T.accent : T.surfaceLine}`,
    }}>
      {children}
    </span>
  );
}

function pct(makes, attempts) {
  if (!attempts) return "–";
  return `${Math.round((makes / attempts) * 100)}%`;
}

// Breaks a player's throw-by-throw log into hit-rates by hand (forehand/backhand/svag hand)
// and by distance bracket, for the detailed stats page.
function computeBreakdowns(throwLog) {
  const hand = {
    forehand: { a: 0, h: 0 },
    backhand: { a: 0, h: 0 },
    weak: { a: 0, h: 0 },
  };
  const dist = [
    { label: "3–10m", min: 3, max: 10, a: 0, h: 0 },
    { label: "11–15m", min: 11, max: 15, a: 0, h: 0 },
    { label: "16–20m", min: 16, max: 20, a: 0, h: 0 },
    { label: "21–30m", min: 21, max: 30, a: 0, h: 0 },
  ];
  (throwLog || []).forEach((t) => {
    const key = t.weakHand ? "weak" : t.hand;
    if (hand[key]) {
      hand[key].a += 1;
      if (t.hit) hand[key].h += 1;
    }
    const bucket = dist.find((b) => t.distance >= b.min && t.distance <= b.max);
    if (bucket) {
      bucket.a += 1;
      if (t.hit) bucket.h += 1;
    }
  });
  return { hand, dist };
}

function BreakdownRow({ label, a, h }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      background: T.bg2, borderRadius: 8, padding: "8px 12px",
    }}>
      <span style={{ fontSize: 13, color: T.ink }}>{label}</span>
      <span style={{ fontFamily: MONO_FONT, fontSize: 13, color: T.chain }}>{h}/{a} ({pct(h, a)})</span>
    </div>
  );
}

function ThrowBreakdown({ lang, throwLog }) {
  const { hand, dist } = computeBreakdowns(throwLog);
  const s = STRINGS[lang];
  const handRows = [
    [s.statForehand, hand.forehand],
    [s.statBackhand, hand.backhand],
    [s.tagWeakHand, hand.weak],
  ].filter(([, v]) => v.a > 0);
  const distRows = dist.filter((b) => b.a > 0);

  if (!handRows.length && !distRows.length) {
    return <div style={{ fontSize: 12, color: T.inkDim, textAlign: "center" }}>{s.noThrowsLogged}</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {handRows.length > 0 && (
        <div>
          <div style={{ fontFamily: MONO_FONT, fontSize: 10, color: T.inkDim, textTransform: "uppercase", marginBottom: 6 }}>{s.statsBreakdownHand}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {handRows.map(([label, v]) => <BreakdownRow key={label} label={label} a={v.a} h={v.h} />)}
          </div>
        </div>
      )}
      {distRows.length > 0 && (
        <div>
          <div style={{ fontFamily: MONO_FONT, fontSize: 10, color: T.inkDim, textTransform: "uppercase", marginBottom: 6 }}>{s.statsBreakdownDistance}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {distRows.map((b) => <BreakdownRow key={b.label} label={b.label} a={b.a} h={b.h} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function computeAwards(lang, players) {
  const withTotals = players.map((p) => {
    const totalAttempts = p.stats.puttAttempts + p.stats.approachAttempts;
    const totalMakes = p.stats.puttMakes + p.stats.approachMakes;
    return { ...p, totalAttempts, totalMakes, hitRate: totalAttempts ? totalMakes / totalAttempts : -1 };
  });

  const byMax = (key) => withTotals.reduce((best, p) => (p[key] > (best ? best[key] : -Infinity) ? p : best), null);

  const hero = byMax("hitRate");
  const longestPutt = withTotals.reduce((best, p) => (p.stats.longestPutt > (best ? best.stats.longestPutt : -1) ? p : best), null);
  const mostForehand = withTotals.reduce((best, p) => (p.stats.forehandMakes > (best ? best.stats.forehandMakes : -1) ? p : best), null);
  const mostPerks = withTotals.reduce((best, p) => (p.stats.perksCount > (best ? best.stats.perksCount : -1) ? p : best), null);
  const comeback = withTotals.reduce((best, p) => ((p.worstDeficit || 0) < (best ? (best.worstDeficit || 0) : 1) ? p : best), null);

  const cards = [];
  if (hero && hero.totalAttempts > 0) cards.push([t(lang, "awardsHero"), hero.name, `${Math.round(hero.hitRate * 100)}%`]);
  if (longestPutt && longestPutt.stats.longestPutt > 0) cards.push([STRINGS[lang].statLongestPutt, longestPutt.name, `${longestPutt.stats.longestPutt}m`]);
  if (mostForehand && mostForehand.stats.forehandMakes > 0) cards.push([t(lang, "awardsMostForehand"), mostForehand.name, `${mostForehand.stats.forehandMakes}`]);
  if (mostPerks && mostPerks.stats.perksCount > 0) cards.push([t(lang, "awardsMostPerks"), mostPerks.name, `${mostPerks.stats.perksCount}`]);
  if (comeback && (comeback.worstDeficit || 0) < 0) cards.push([t(lang, "awardsComeback"), comeback.name, `${comeback.worstDeficit}`]);
  return cards;
}

function ResultsScreen({ lang, players, winnerIdx, onReplay }) {
  const [showStats, setShowStats] = useState(false);
  const ranked = useMemo(
    () => players.map((p, i) => ({ ...p, i })).sort((a, b) => b.score - a.score),
    [players]
  );
  const medals = ["🥇", "🥈", "🥉"];
  const awards = useMemo(() => computeAwards(lang, players), [lang, players]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Podium first — names only, big and simple */}
      <div style={{ textAlign: "center", padding: "16px 0", display: "flex", flexDirection: "column", gap: 10 }}>
        {ranked.slice(0, 3).map((p, i) => (
          <div key={p.i} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <span style={{ fontSize: i === 0 ? 34 : 24 }}>{medals[i]}</span>
            <span style={{ fontFamily: DISPLAY_FONT, fontSize: i === 0 ? 34 : 22, color: i === 0 ? T.accent : T.ink }}>{p.name}</span>
          </div>
        ))}
      </div>

      {/* Then: fun award categories, not raw stats */}
      {awards.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {awards.map(([label, name, val]) => (
            <div key={label} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              background: T.surface, border: `1px solid ${T.surfaceLine}`, borderRadius: 12, padding: "10px 14px",
            }}>
              <div>
                <div style={{ fontFamily: MONO_FONT, fontSize: 10, color: T.inkDim, textTransform: "uppercase" }}>{label}</div>
                <div style={{ fontFamily: DISPLAY_FONT, fontSize: 16 }}>{name}</div>
              </div>
              <div style={{ fontFamily: MONO_FONT, fontSize: 14, color: T.accent }}>{val}</div>
            </div>
          ))}
        </div>
      )}

      <button onClick={() => setShowStats((v) => !v)} style={{
        background: "none", border: `1px solid ${T.surfaceLine}`, borderRadius: 10,
        color: T.inkDim, padding: "10px", cursor: "pointer", fontFamily: BODY_FONT, fontSize: 12,
      }}>
        {showStats ? t(lang, "hideStats") : t(lang, "showStats")}
      </button>

      {showStats && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ranked.map((p, rank) => {
            const totalAttempts = p.stats.puttAttempts + p.stats.approachAttempts;
            const totalMakes = p.stats.puttMakes + p.stats.approachMakes;
            const items = [
              [STRINGS[lang].statHit, pct(totalMakes, totalAttempts)],
              [STRINGS[lang].statPutt, pct(p.stats.puttMakes, p.stats.puttAttempts)],
              [STRINGS[lang].statApproach, pct(p.stats.approachMakes, p.stats.approachAttempts)],
              [STRINGS[lang].statForehand, pct(p.stats.forehandMakes, p.stats.forehand)],
              [STRINGS[lang].statBackhand, pct(p.stats.backhandMakes, p.stats.backhand)],
              [STRINGS[lang].statLongestPutt, p.stats.longestPutt ? `${p.stats.longestPutt}m` : "–"],
            ];
            return (
              <div key={p.i} style={{
                background: T.surface, border: `1px solid ${p.i === winnerIdx ? T.accent : T.surfaceLine}`,
                borderRadius: 14, padding: 16,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: MONO_FONT, color: T.inkDim, fontSize: 13 }}>#{rank + 1}</span>
                    <span style={{ fontFamily: DISPLAY_FONT, fontSize: 18 }}>{p.name}</span>
                  </div>
                  <span style={{ fontFamily: DISPLAY_FONT, fontSize: 20, color: T.accent }}>{p.score}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, fontFamily: MONO_FONT }}>
                  {items.map(([label, val]) => (
                    <div key={label} style={{ background: T.bg2, borderRadius: 8, padding: "8px 6px", textAlign: "center" }}>
                      <div style={{ fontSize: 15, color: T.chain }}>{val}</div>
                      <div style={{ fontSize: 9, color: T.inkDim, marginTop: 2, textTransform: "uppercase" }}>{label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 12 }}>
                  <ThrowBreakdown lang={lang} throwLog={p.throwLog} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button onClick={onReplay} style={{
        padding: "16px", borderRadius: 12, border: "none", cursor: "pointer",
        background: T.accent, color: T.accentInk, fontFamily: DISPLAY_FONT, fontSize: 16,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      }}>
        <Target size={18} /> {t(lang, "playAgain")}
      </button>
    </div>
  );
}
