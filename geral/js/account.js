import { supabase } from './supabase.js';
import { authManager } from './auth.js';
import { showToast, renderProducts, showLoader, hideLoader } from './ui.js';
import { wishlistManager } from './wishlist.js';

// Função para popular o formulário com dados do perfil
function populateForm(profile) {
    if (!profile) return;
    document.getElementById('accountName').value = profile.full_name || '';
    document.getElementById('accountPhone').value = profile.phone || '';
    document.getElementById('avatarPreview').src = profile.avatar_url || 'geral/img/logo/simbolo.png';
    // Endereço
    document.getElementById('accountZipcode').value = profile.address_zipcode || '';
    document.getElementById('accountStreet').value = profile.address_street || '';
    document.getElementById('accountNumber').value = profile.address_number || '';
    document.getElementById('accountComplement').value = profile.address_complement || '';
    document.getElementById('accountNeighborhood').value = profile.address_neighborhood || '';
    document.getElementById('accountCity').value = profile.address_city || '';
    document.getElementById('accountState').value = profile.address_state || '';
}

// Função para buscar endereço via CEP (ViaCEP API)
async function fetchAddressByCep(cep) {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
        showToast('CEP inválido.', 'error');
        return;
    }

    showLoader();
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        if (data.erro) {
            showToast('CEP não encontrado.', 'error');
            return;
        }
        document.getElementById('accountStreet').value = data.logradouro || '';
        document.getElementById('accountNeighborhood').value = data.bairro || '';
        document.getElementById('accountCity').value = data.localidade || '';
        document.getElementById('accountState').value = data.uf || '';
        showToast('Endereço preenchido!', 'success');
    } catch (error) {
        showToast('Erro ao buscar CEP. Tente novamente.', 'error');
    } finally {
        hideLoader();
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    showLoader(); // Mostra o loader no início

    const user = await authManager.getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // Seleção de elementos do DOM
    const accountForm = document.getElementById('accountForm');
    const emailInput = document.getElementById('accountEmail');
    const editBtn = document.getElementById('edit-btn');
    const saveBtn = document.getElementById('save-btn');
    const avatarUploadInput = document.getElementById('avatarUpload');
    const searchCepBtn = document.getElementById('search-cep-btn');

    // Popula o email (que não muda)
    emailInput.value = user.email;

    // Busca e popula os dados do perfil
    const profile = await authManager.fetchUserProfile();
    populateForm(profile);

    // Função para alternar o modo de edição do formulário
    const toggleEditMode = (isEditing) => {
        const inputs = accountForm.querySelectorAll('input[type="text"], input[type="tel"]');
        inputs.forEach(input => input.readOnly = !isEditing);
        searchCepBtn.disabled = !isEditing;
        saveBtn.style.display = isEditing ? 'inline-block' : 'none';
        editBtn.style.display = isEditing ? 'none' : 'inline-block';
    };

    toggleEditMode(false);

    // Event Listeners
    editBtn.addEventListener('click', () => toggleEditMode(true));

    searchCepBtn.addEventListener('click', () => {
        const cep = document.getElementById('accountZipcode').value;
        fetchAddressByCep(cep);
    });

    avatarUploadInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        showLoader();
        try {
            const newAvatarUrl = await authManager.uploadAvatar(file);
            document.getElementById('avatarPreview').src = newAvatarUrl;
            showToast('Foto de perfil atualizada!', 'success');
        } catch (error) {
            showToast(`Erro ao enviar foto: ${error.message}`, 'error');
        } finally {
            hideLoader();
        }
    });

    accountForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        showLoader();

        const updates = {
            full_name: document.getElementById('accountName').value,
            phone: document.getElementById('accountPhone').value,
            address_zipcode: document.getElementById('accountZipcode').value,
            address_street: document.getElementById('accountStreet').value,
            address_number: document.getElementById('accountNumber').value,
            address_complement: document.getElementById('accountComplement').value,
            address_neighborhood: document.getElementById('accountNeighborhood').value,
            address_city: document.getElementById('accountCity').value,
            address_state: document.getElementById('accountState').value,
        };

        const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);

        if (error) {
            showToast(`Erro ao atualizar perfil: ${error.message}`, 'error');
        } else {
            showToast('Perfil atualizado com sucesso!');
            toggleEditMode(false);
        }
        hideLoader();
    });

    // Carregar Wishlist e Pedidos (sem alterações aqui, mas mantido)
    const ordersContainer = document.getElementById('ordersContainer');
    const wishlistContainer = document.getElementById('wishlistContainer');

    // Carregar Wishlist
    if (wishlistContainer) {
        const wishlistProducts = await wishlistManager.getWishlist();
        renderProducts(wishlistProducts, 'wishlistContainer');
        wishlistContainer.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            if (card && card.dataset.id) window.location.href = `item.html?id=${card.dataset.id}`;
        });
    }

    // Carregar Pedidos
    if (ordersContainer) {
        const { data: orders, error } = await supabase
            .from('orders')
            .select(`*, order_items(*, products(*))`)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            ordersContainer.innerHTML = '<p>Não foi possível carregar os pedidos.</p>';
        } else if (!orders.length) {
            ordersContainer.innerHTML = '<p>Você ainda não fez nenhum pedido.</p>';
        } else {
            const statusTranslations = { pending: 'Pendente', shipped: 'Enviado', completed: 'Concluído', canceled: 'Cancelado' };
            ordersContainer.innerHTML = orders.map(order => `
                <div class="order-history-item">
                    <h2>Pedido #${order.id} - ${new Date(order.created_at).toLocaleDateString()}</h2>
                    <p>Status: <span class="order-status--${order.status}">${statusTranslations[order.status] || order.status}</span></p>
                    <p>Total: ${Number(order.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    <ul>
                    ${order.order_items.map(item => `
                        <li>• ${item.quantity}x ${item.products?.name || 'Produto Removido'}</li>
                    `).join('')}
                    </ul>
                </div>
            `).join('');
        }
    }

    hideLoader(); 
});