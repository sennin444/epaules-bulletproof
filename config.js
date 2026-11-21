// Épaules Bulletproof · réglages du funnel (tout ce qui change sans toucher au design)
window.EB_CONFIG = {
  // Prix
  price: 27,
  priceAfter: 97,            // prix barré : Douglas confirme le passage réel à 97 € après le 30/11
  bumpPrice: 12,             // Guide Feu Vert (order bump, nom à confirmer par Christophe)
  upsellPrice: 47,           // Analyse vidéo avant ton Bilan
  showDiscountBadge: true,   // pastille de réduction
  discountPct: 70,           // décision de Douglas : « -70 % » (le calcul exact donnerait 72)
  showMockTags: true,        // étiquettes « Maquette » : passer à false une fois Stripe branché

  // Fin du prix de lancement (heure de Paris)
  launchEndsAt: "2026-11-30T23:59:00+01:00",

  // Bilan Articulaire : places par semaine (Christophe fixe ce chiffre)
  bilanSlotsPerWeek: 10,

  // Liens (vides = maquette : le parcours reste dans le site)
  checkoutUrl: "",           // laisser vide : le bouton descend vers le bloc #paiement de la page

  // Paiement Whop (compte de Christophe). Dès que whopUrl est rempli : les champs carte de la maquette
  // et les étiquettes « Maquette » disparaissent, le bouton envoie vers Whop.
  // Dans Whop, redirection après achat : https://<domaine>/acces?total=27  (offre seule)
  //                                      https://<domaine>/acces?total=39&bump=1  (offre + Guide Feu Vert)
  whopUrl: "",               // A_REMPLIR : lien de paiement Whop de l'offre à 27 €
  whopUrlBump: "",           // lien Whop de l'offre à 39 € avec le Guide. Vide = pas de bump affiché
  upsellUrl: "",             // Stripe plus tard. Vide = /acces?upsell=1
  accessUrl: "https://train.strivee.app/program/FnjyIkJzfcY9zCMhrlJd",
  calendlyUrl: "",           // A_REMPLIR : Calendly « Bilan Articulaire »

  // Emplacements de preuve sociale : true = on montre les cadres « en attente d'accord »
  // Passer à false pour la mise en ligne si les témoignages ne sont pas validés.
  showProofSlots: true,

  metaPixelId: ""
};
