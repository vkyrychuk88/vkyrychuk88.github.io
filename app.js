const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');
const loading = document.getElementById('loading');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loading.style.display = 'block';
    errorMessage.textContent = '';

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const credentials = btoa(`${username}:${password}`);

    try {
        const response = await fetch('https://learn.01founders.co/api/auth/signin', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Invalid credentials');
        }

        const token = await response.json();
        
        // Test GraphQL query with the token
        const testQuery = await testGraphQLQuery(token);
        if (testQuery.errors) {
            throw new Error('GraphQL query test failed');
        }

        localStorage.setItem('jwt', token);
        window.location.href = 'profile.html';
    } catch (error) {
        errorMessage.textContent = error.message;
    } finally {
        loading.style.display = 'none';
    }
});

async function testGraphQLQuery(token) {
    const query = `
        query {
            user {
                login
                transactions(where: {type: {_eq: "xp"}}, order_by: {createdAt: asc}) {
                    amount
                    createdAt
                }
                progresses(order_by: {createdAt: asc}) {
                    grade
                    object {
                        name
                    }
                }
            }
        }
    `;

    const response = await fetch('https://learn.01founders.co/api/graphql-engine/v1/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query })
    });

    return await response.json();
}
