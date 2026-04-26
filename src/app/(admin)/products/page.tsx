const syncFromQikink = async () => {
  setLoading(true);
  try {
    const res = await fetch('/api/qikink/sync');
    const result = await res.json();

    // Qikink API response check
    const items = result.products || result.data || (Array.isArray(result) ? result : []);

    if (items.length > 0) {
      for (const item of items) {
        // Aapke screenshot mein 'Product ID' 63917376 jaisa hai
        const sku = item.sku || `QK-${item.product_id || item.id}`;
        
        const exists = products.find(p => p.sku === sku);
        
        if (!exists) {
          await addDoc(collection(db, "products"), {
            name: item.name || item.product_name || "Qikink Product",
            sku: sku,
            basePrice: Number(item.price || item.product_price || 0),
            image: item.image || item.product_image || "https://via.placeholder.com/150",
            margin: 150,
            finalPrice: Number(item.price || item.product_price || 0) + 150,
            source: "qikink",
            createdAt: serverTimestamp()
          });
        }
      }
      alert("✅ Sync Success: " + items.length + " products processed!");
      loadData();
    } else {
      alert("⚠️ API Response empty. Check console for details.");
    }
  } catch (err) {
    alert("❌ Sync Error");
  } finally {
    setLoading(false);
  }
};
