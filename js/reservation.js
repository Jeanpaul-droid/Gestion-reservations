// Variables globales
let currentStep = 1;
let totalPrice = 0;
let basePrice = 0;
let optionsPrice = 0;

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page de réservation chargée');
    
    // Définir la date minimum à aujourd'hui
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('reservationDate').min = today;
    
    // Écouter les changements pour mettre à jour le prix
    document.getElementById('serviceType').addEventListener('change', updatePrice);
    document.querySelectorAll('input[type="checkbox"][data-price]').forEach(checkbox => {
        checkbox.addEventListener('change', updatePrice);
    });
});

// Fonction pour mettre à jour le prix total
function updatePrice() {
    // Prix de base
    const serviceSelect = document.getElementById('serviceType');
    const selectedOption = serviceSelect.options[serviceSelect.selectedIndex];
    basePrice = selectedOption.value ? parseFloat(selectedOption.dataset.price) : 0;
    
    // Prix des options
    optionsPrice = 0;
    document.querySelectorAll('input[type="checkbox"][data-price]:checked').forEach(checkbox => {
        optionsPrice += parseFloat(checkbox.dataset.price);
    });
    
    // Total
    totalPrice = basePrice + optionsPrice;
    
    // Mise à jour de l'affichage
    document.getElementById('base-price').textContent = basePrice + '€';
    document.getElementById('options-price').textContent = optionsPrice + '€';
    document.getElementById('total-price').textContent = totalPrice + '€';
}

// Fonction pour passer à l'étape suivante
function nextStep(step) {
    // Validation basique
    if (!validateStep(currentStep)) {
        return;
    }
    
    // Cacher l'étape actuelle
    document.getElementById(`step${currentStep}`).classList.remove('active');
    document.getElementById(`step${currentStep}-indicator`).classList.remove('active');
    document.getElementById(`step${currentStep}-indicator`).classList.add('completed');
    
    // Afficher la nouvelle étape
    currentStep = step;
    document.getElementById(`step${currentStep}`).classList.add('active');
    document.getElementById(`step${currentStep}-indicator`).classList.add('active');
    
    // Si c'est la dernière étape, mettre à jour le récapitulatif
    if (currentStep === 4) {
        updateSummary();
    }
}

// Fonction pour revenir à l'étape précédente
function prevStep(step) {
    document.getElementById(`step${currentStep}`).classList.remove('active');
    currentStep = step;
    document.getElementById(`step${currentStep}`).classList.add('active');
    document.getElementById(`step${step}-indicator`).classList.remove('completed');
}

// Validation des étapes
function validateStep(step) {
    switch(step) {
        case 1:
            const service = document.getElementById('serviceType').value;
            if (!service) {
                alert('Veuillez sélectionner un service');
                return false;
            }
            return true;
            
        case 2:
            const date = document.getElementById('reservationDate').value;
            const time = document.getElementById('reservationTime').value;
            if (!date || !time) {
                alert('Veuillez sélectionner une date et une heure');
                return false;
            }
            return true;
            
        case 3:
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            
            if (!firstName || !lastName || !email || !phone) {
                alert('Veuillez remplir tous les champs obligatoires');
                return false;
            }
            
            if (!email.includes('@')) {
                alert('Veuillez entrer un email valide');
                return false;
            }
            
            if (!/^\d{10}$/.test(phone)) {
                alert('Le téléphone doit contenir 10 chiffres');
                return false;
            }
            return true;
            
        default:
            return true;
    }
}

// Mise à jour du récapitulatif
function updateSummary() {
    const service = document.getElementById('serviceType');
    const serviceText = service.options[service.selectedIndex].text;
    
    const date = document.getElementById('reservationDate').value;
    const time = document.getElementById('reservationTime').value;
    
    const options = [];
    document.querySelectorAll('input[type="checkbox"][data-price]:checked').forEach(checkbox => {
        options.push(checkbox.nextElementSibling.textContent.trim());
    });
    
    document.getElementById('summary-service').textContent = serviceText;
    document.getElementById('summary-datetime').textContent = `${date} à ${time}`;
    document.getElementById('summary-options').textContent = options.length ? options.join(', ') : 'Aucune';
    document.getElementById('summary-total').textContent = totalPrice + '€';
}

// Confirmation de la réservation
function confirmReservation() {
    if (!document.getElementById('acceptTerms').checked) {
        alert('Veuillez accepter les conditions générales');
        return;
    }
    
    // Générer un numéro de réservation aléatoire
    const reservationNumber = 'RES-' + new Date().getFullYear() + '-' + 
                             Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    document.getElementById('reservationNumber').textContent = reservationNumber;
    
    // Sauvegarder dans localStorage pour simuler une base de données
    const reservation = {
        number: reservationNumber,
        service: document.getElementById('summary-service').textContent,
        datetime: document.getElementById('summary-datetime').textContent,
        total: totalPrice + '€',
        date: new Date().toISOString()
    };
    
    let reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
    reservations.push(reservation);
    localStorage.setItem('reservations', JSON.stringify(reservations));
    
    // Afficher le modal de confirmation
    const modal = new bootstrap.Modal(document.getElementById('confirmationModal'));
    modal.show();
    
    // Réinitialiser le formulaire (optionnel)
    setTimeout(() => {
        window.location.href = 'confirmation.html?num=' + reservationNumber;
    }, 3000);
}