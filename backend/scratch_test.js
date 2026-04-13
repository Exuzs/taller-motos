async function testAdmin() {
  try {
    // 1. Login
    const loginRes = await fetch("http://localhost:3000/api/auth/login", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: "admin@taller.com", password: "admin123" })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log("Login successful, token:", token.substring(0, 20) + "...");
    console.log("User role:", loginData.user.role);

    // 2. Try to get clients
    const clientsRes = await fetch("http://localhost:3000/api/clients", {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Clients:", await clientsRes.json());

    // 3. Try to get bikes
    const bikesRes = await fetch("http://localhost:3000/api/bikes", {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Bikes:", await bikesRes.json());

    // 4. Try to create work order (assuming motoId 1)
    const orderRes = await fetch("http://localhost:3000/api/work-orders", {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ motoId: 1, faultDescription: "Test from script" })
    });
    const orderData = await orderRes.json();
    
    if (orderRes.ok) {
        console.log("Order created successfully!", orderData);
    } else {
        console.log("Failed to create order:", orderData);
    }
  } catch (error) {
    console.error("Test failed:", error.message);
  }
}

testAdmin();
