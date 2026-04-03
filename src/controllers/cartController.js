const supabase = require('../config/supabase');

const cartController = {
  getCart: async (req, res) => {
    const { customerId } = req.query; 

    try {
      let { data: cart, error: cartError } = await supabase.from('Cart').select('cartID').eq('idCustomer', customerId).single();

      if (!cart) {
        const { data: newCart, error: createError } = await supabase.from('Cart').insert([{ idCustomer: customerId, updateAt: new Date() }]).select().single();
        if (createError) throw createError;
        cart = newCart;
      }

      const { data: cartItems, error: itemsError } = await supabase
        .from('CartItem')
        .select(`cartItemID, quantity, Book (bookID, title, price, BookImages(imageURL))`)
        .eq('idCart', cart.cartID)
        .order('cartItemID', { ascending: true });

      if (itemsError) throw itemsError;

      const totalAmount = cartItems.reduce((sum, item) => sum + (item.quantity * item.Book.price), 0);

      res.status(200).json({ cartID: cart.cartID, items: cartItems, totalAmount });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  addToCart: async (req, res) => {
    const { customerId, bookId, quantity } = req.body;

    try {
      const { data: cart } = await supabase.from('Cart').select('cartID').eq('idCustomer', customerId).single();
      
      const { data: existingItem } = await supabase.from('CartItem').select('*').eq('idCart', cart.cartID).eq('idBook', bookId).single();

      if (existingItem) {
        const { data, error } = await supabase.from('CartItem')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('cartItemID', existingItem.cartItemID)
          .select();
        if (error) throw error;
        res.status(200).json({ message: "Đã cập nhật số lượng sách trong giỏ!", data });
      } else {
        const { data, error } = await supabase.from('CartItem').insert([{ idCart: cart.cartID, idBook: bookId, quantity }]).select();
        if (error) throw error;
        res.status(201).json({ message: "Đã thêm sách mới vào giỏ!", data });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Cập nhật số lượng (Tăng/giảm/Set trực tiếp) của 1 ô giỏ hàng
  updateCartItemQuantity: async (req, res) => {
    const { cartItemId } = req.params;
    const { quantity } = req.body;

    try {
      if (quantity <= 0) {
        // Nếu quantity <= 0, coi như là xoá
        const { error } = await supabase.from('CartItem').delete().eq('cartItemID', cartItemId);
        if (error) throw error;
        return res.status(200).json({ message: "Đã xóa sản phẩm khỏi giỏ hàng." });
      }

      const { data, error } = await supabase.from('CartItem').update({ quantity }).eq('cartItemID', cartItemId).select();
      if (error) throw error;
      res.status(200).json({ message: "Đã cập nhật số lượng", data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Xóa thủ công 1 ô giỏ hàng
  removeCartItem: async (req, res) => {
    const { cartItemId } = req.params;
    try {
      const { error } = await supabase.from('CartItem').delete().eq('cartItemID', cartItemId);
      if (error) throw error;
      res.status(200).json({ message: "Đã xóa sản phẩm khỏi giỏ hàng." });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = cartController;