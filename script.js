document.addEventListener("DOMContentLoaded", () => {
    // ----------------------
    // PRODUITS (Mise en mémoire)
    // ----------------------
// --- TA BASE DE DONNÉES ARTICLES ---

    



    let cart = []; 
    window.currentDiscount = 0; 
    window.finalPriceCalculated = 0;

    const cartItems = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");
    const cartPanel = document.getElementById("cart-panel");
    const cartToggle = document.getElementById("cart-toggle");


    function updateCart() {
        if (!cartItems) return;
        cartItems.innerHTML = "";
        let totalBrut = 0;

        
        cart.forEach((item, index) => {
            totalBrut += item.price;
            const div = document.createElement("div");
            div.className = "cart-item";
            div.style = "display:flex; justify-content:space-between; padding:8px; border-bottom:1px solid rgba(255,255,255,0.1); font-size:14px;";
            div.innerHTML = `
                <span>${item.name}</span>
                <span>
                    <b>${item.price}€</b>
                    <button data-index="${index}" class="remove-item" style="background:none; border:none; color:#ff4444; cursor:pointer; margin-left:8px; font-weight:bold;">×</button>
                </span>
            `;
            cartItems.appendChild(div);
        });

        // Calcul avec Promo
        if (window.currentDiscount > 0) {
            let reduction = (totalBrut * window.currentDiscount) / 100;
            window.finalPriceCalculated = (totalBrut - reduction).toFixed(2);
            if (cartTotal) {
                cartTotal.innerHTML = `
                    <span style="text-decoration:line-through; opacity:0.5; font-size:0.8em;">${totalBrut}€</span> 
                    <span style="color:var(--gold); font-weight:bold;">${window.finalPriceCalculated}€</span>
                `;
            }
        } else {
            window.finalPriceCalculated = totalBrut.toFixed(2);
            if (cartTotal) cartTotal.textContent = totalBrut + "€";
        }

        // Ajout du bouton de paiement
        if (cart.length > 0) {
            const payButton = document.createElement("button");
            payButton.className = "btn-primary checkout-btn";
            payButton.style = "width:100%; marginTop:15px; padding:12px; cursor:pointer; background:var(--gold); color:black; border:none; font-weight:bold; border-radius:8px;";
            payButton.innerText = "Passer à la caisse";
            payButton.onclick = () => window.openPayment();
            cartItems.appendChild(payButton);
        }

        // Gestion de la suppression
        document.querySelectorAll(".remove-item").forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.dataset.index);
                cart.splice(idx, 1);
                updateCart();
            };
        });
    }

    function addToCart(name, price) {
        cart.push({ name: name, price: parseInt(price) });
        updateCart();
    }

    // Boutons "Ajouter au panier"
    document.querySelectorAll(".add-cart").forEach(btn => {
        btn.addEventListener("click", () => {
            const card = btn.closest(".product-card");
            const name = card.querySelector("h3").textContent;
            const price = card.querySelector(".price").textContent;
            addToCart(name, price);
        });
    });

    // Toggle panier (Ouverture/Fermeture)
    if (cartToggle) {
        cartToggle.addEventListener("click", () => {
            const isClosing = cartPanel.classList.toggle("cart-closed");
            
            if (isClosing) {
                // Animation de réduction
                cartPanel.style.height = "65px"; // On réduit à la taille du header
                cartPanel.style.width = "250px"; // Optionnel : on le rend un peu plus étroit
                cartPanel.style.opacity = "0.7";
                cartToggle.textContent = "+";
                cartToggle.style.transform = "rotate(0deg)";
            } else {
                // Animation d'agrandissement
                cartPanel.style.height = "550px"; // Ta taille idéale une fois ouvert
                cartPanel.style.width = "350px";  // Largeur normale
                cartPanel.style.opacity = "1";
                cartToggle.textContent = "–";
                cartToggle.style.transform = "rotate(180deg)";
            }
        });
    }

// ------------------------------------------------
// ASSISTANT IA "HUMAIN" - MODE DISCUSSION & PRINT
// ------------------------------------------------

// 1. Tes données produits (Base de référence)
const produits = [
    { name: "T-shirt Noir Oversize", price: 15, type: "tshirt", style: "oversize", color: "noir" },
    { name: "T-shirt Blanc Fit", price: 85, type: "tshirt", style: "fit", color: "blanc" },
    { name: "Pull Zip Blanc", price: 25, type: "gilet", style: "zip", color: "blanc" },
    { name: "Pull Oversize Dark", price: 25, type: "gilet", style: "oversize", color: "noir" }
];

// 2. Initialisation des variables de l'assistant
const messagesContainer = document.getElementById("messages");
const assistantInput = document.getElementById("assistant-input");
const assistantForm = document.getElementById("assistant-form");
const suggCont = document.getElementById("assistant-suggestions");

let userProfile = { 
    name: null, 
    style: null, 
    type: null, 
    budget: null 
};

let step = 0; // Suivi de la conversation

// --- FONCTION PRINT (Effet machine à écrire) ---
function printMessage(text, from = "bot") {
    if (!messagesContainer) return;

    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${from}`;
    messagesContainer.appendChild(msgDiv);
    
    let i = 0;
    function typeWriter() {
        if (i < text.length) {
            msgDiv.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 25); // Vitesse fluide
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }
    typeWriter();
}

// --- LOGIQUE DE RÉPONSE HUMAINE ---
function processUserResponse(input) {
    const q = input.toLowerCase();

    // Scan permanent des mots-clés (pour enrichir le profil à chaque message)
    if (q.includes("oversize") || q.includes("large")) userProfile.style = "oversize";
    if (q.includes("fit") || q.includes("serré")) userProfile.style = "fit";
    if (q.includes("t-shirt") || q.includes("tee")) userProfile.type = "tshirt";
    if (q.includes("gilet") || q.includes("pull") || q.includes("zip")) userProfile.type = "gilet";
    
    const budgetMatch = q.match(/(\d+)/);
    if (budgetMatch) userProfile.budget = parseInt(budgetMatch[1]);

    // Gestion du Small Talk (Humain)
    if (q.includes("ça va") || q.includes("comment vas-tu") || q.includes("cv")) {
        return "Je vais super bien bg ! Toujours prêt à dénicher les meilleures sapes. Et toi ?";
    }
    if (q.includes("qui es-tu") || q.includes("ton nom")) {
        return "Je suis l'IA de Maxandre Shop. Mon job, c'est que tu sois le mieux sapé du quartier.";
    }

    // --- LOGIQUE PAS À PAS ---
    
    // Étape 0 : Accueil et demande du nom
    if (step === 0) {
        step = 1;
        return "Enchanté ! Moi c'est l'IA de Maxandre. C'est quoi ton petit nom ?";
    }
    
    // Étape 1 : Enregistrement du nom et demande du style
    if (step === 1 && !userProfile.name) {
        userProfile.name = input;
        step = 2;
        return `Ok ${userProfile.name}, lourd comme blaze. T'es plutôt branché coupes larges (oversize) ou un truc bien ajusté (fit) ?`;
    }

    // Étape 2 : Demande du type de produit
    if (step === 2) {
        step = 3;
        return "Je vois le genre ! Tu cherches quoi précisément ? Un T-shirt ou plutôt un gilet/pull ?";
    }

    // Étape 3 : Demande du budget
    if (step === 3 && !userProfile.budget) {
        step = 4;
        return `Dernier détail ${userProfile.name} : c'est quoi ton budget max pour cette pièce ?`;
    }

    // --- RECHERCHE FINALE (Matches) ---
    const matches = produits.filter(p => {
        // On vérifie si le produit correspond aux critères remplis
        const matchStyle = userProfile.style ? p.style === userProfile.style : true;
        const matchType = userProfile.type ? p.type === userProfile.type : true;
        const matchBudget = userProfile.budget ? p.price <= userProfile.budget : true;
        return matchStyle && matchType && matchBudget;
    });

    if (matches.length > 0) {
        setTimeout(() => displaySuggestions(matches), 800);
        return `Écoute ${userProfile.name}, j'ai fouillé le stock. Voici mes pépites pour toi :`;
    }

    return "J'ai bien cherché, mais j'ai rien qui match à 100% bg. Essaie d'élargir tes critères !";
}

// --- AFFICHAGE DES SUGGESTIONS ---
function displaySuggestions(list) {
    if (!suggCont) return;
    suggCont.innerHTML = ""; // Reset
    
    list.slice(0, 3).forEach(p => {
        const card = document.createElement("div");
        card.className = "suggestion-card";
        card.style.animation = "fadeIn 0.5s ease-out";
        card.innerHTML = `
            <div style="display:flex; flex-direction:column;">
                <strong style="color:var(--gold);">${p.name}</strong>
                <span style="font-size:13px; opacity:0.8;">${p.price}€</span>
            </div>
            <button class="btn-shiny" onclick="ajouterAuPanier('${p.name}', ${p.price})" style="padding:8px 15px; font-size:12px; border-radius:8px;">Prendre</button>
        `;
        suggCont.appendChild(card);
    });
}

// --- GESTION DU FORMULAIRE ---
if (assistantForm) {
    assistantForm.addEventListener("submit", (e) => {
        e.preventDefault(); // Empêche le rafraîchissement (le fameux /?)
        
        const val = assistantInput.value.trim();
        if (!val) return;

        // Bulle message utilisateur
        const userDiv = document.createElement("div");
        userDiv.className = "message user";
        userDiv.textContent = val;
        messagesContainer.appendChild(userDiv);
        
        assistantInput.value = "";
        
        // Réponse IA après petit délai de "réflexion"
        setTimeout(() => {
            const response = processUserResponse(val);
            printMessage(response, "bot");
        }, 600);
    });
}

// --- LANCEMENT INITIAL ---
window.addEventListener('load', () => {
    setTimeout(() => {
        printMessage("Yo ! Bienvenue sur Maxandre Shop. T'es prêt à trouver ton style ?", "bot");
    }, 1000);
});
    // ----------------------
    // ANIMATIONS DES CARTES
    // ----------------------
    document.querySelectorAll(".product-card").forEach(card => {
        card.addEventListener("mousemove", e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const rX = ((y - (rect.height / 2)) / (rect.height / 2)) * 6;
            const rY = ((x - (rect.width / 2)) / (rect.width / 2)) * -6;
            card.style.transform = `perspective(800px) rotateX(${rX}deg) rotateY(${rY}deg) scale(1.03)`;
            card.style.setProperty("--mx", `${x}px`);
            card.style.setProperty("--my", `${y}px`);
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "";
            card.classList.remove("ripple");
        });

        card.addEventListener("mouseenter", () => {
            card.style.setProperty("--ripple-x", `${Math.random() * 100}%`);
            card.style.setProperty("--ripple-y", `${Math.random() * 100}%`);
            card.classList.add("ripple");
        });
    });

    // ----------------------
    // GESTION MODALE PAIEMENT
    // ----------------------
    const paymentModal = document.getElementById('payment-modal');
    const closePaymentBtn = document.getElementById('close-payment-btn');

    window.openPayment = () => {
        if (paymentModal) {
            paymentModal.style.display = 'flex';
            setTimeout(() => {
                paymentModal.classList.add('active');
                paymentModal.style.opacity = '1';
                const content = paymentModal.querySelector('.payment-content');
                if (content) content.style.transform = 'scale(1) translateY(0)';
            }, 10);
        }
    };

    if (closePaymentBtn) {
        closePaymentBtn.onclick = () => {
            paymentModal.style.opacity = '0';
            const content = paymentModal.querySelector('.payment-content');
            if (content) content.style.transform = 'scale(0.9) translateY(20px)';
            setTimeout(() => {
                paymentModal.classList.remove('active');
                paymentModal.style.display = 'none';
            }, 400);
        };
    }

    window.addEventListener('click', (event) => {
        if (event.target === paymentModal) {
            if (closePaymentBtn) closePaymentBtn.onclick();
        }
    });
});

// ------------------------------------------
// FONCTIONS GLOBALES (PROMO & MODES PAIEMENT)
// ------------------------------------------

async function checkPromo() {
    const codeInput = document.getElementById('promo-input');
    const msg = document.getElementById('promo-msg');
    if (!codeInput) return;

    const code = codeInput.value.trim();
    if (code === "Maëlis") { window.location.href = "/admin"; return; }
    if (!code) return;

    try {
        const response = await fetch('/api/check-promo', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ code: code })
        });

        if (response.ok) {
            const data = await response.json();
            window.currentDiscount = data.remise;
            msg.innerHTML = `<span style="color:#4CAF50;">✅ Réduction -${data.remise}% appliquée !</span>`;
            // Note: On pourrait relancer updateCart() ici si elle était globale
            alert("Promo activée ! Le total du panier a été mis à jour.");
        } else {
            msg.innerHTML = `<span style="color:#ff4444;">❌ Code invalide</span>`;
            window.currentDiscount = 0;
        }
    } catch (e) {
        msg.innerHTML = "Erreur serveur.";
    }
}

window.processPayment = (type) => {
    if (type === 'paypal') {
        alert("Redirection vers PayPal sécurisé...");
    } else if (type === 'apple') {
        alert("Apple Pay est disponible uniquement sur iOS/Safari.");
    } else if (type === 'cash') {
        const form = document.getElementById('cash-form-container');
        if (form) {
            form.style.display = 'block';
            const inputArticle = document.getElementById('order-item') || document.getElementById('cash-article');
            const inputPrix = document.getElementById('order-price') || document.getElementById('cash-price');
            
            // Remplissage automatique avec les données du panier
            if (inputPrix) inputPrix.value = window.finalPriceCalculated + "€";
            
            form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
};

function submitCashOrder() {
    const nom = document.getElementById('cash-nom') || document.getElementById('order-nom');
    const article = document.getElementById('cash-article') || document.getElementById('order-item');

    if (!nom || !nom.value.trim()) {
        alert("⚠️ Ton nom est obligatoire !");
        return;
    }

    alert(`Demande reçue pour : ${article ? article.value : "la commande"}. \nMaxandre va te contacter !`);
    document.getElementById('payment-modal').style.display = 'none';
}