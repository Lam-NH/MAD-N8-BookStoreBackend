const supabase = require('../config/supabase');

const orderController = {
  // 1. Đặt hàng từ Giỏ hàng (Checkout)
  checkout: async (req, res) => {
    const { customerId, addressId, paymentId, shipmentId, voucherId } = req.body;

    try {
      const { data: cart } = await supabase.from('Cart').select('cartID').eq('idCustomer', customerId).single();
      if (!cart) return res.status(400).json({ message: "Giỏ hàng trống!" });
      
      const { data: cartItems, error: itemsError } = await supabase
        .from('CartItem')
        .select('idBook, quantity, Book(price)')
        .eq('idCart', cart.cartID);

      if (!cartItems || cartItems.length === 0) return res.status(400).json({ message: "Giỏ hàng trống!" });

      let totalAmount = cartItems.reduce((sum, item) => sum + (item.quantity * item.Book.price), 0);
      let finalAmount = totalAmount;

      // Xử lý Voucher nếu CÓ
      if (voucherId) {
        const { data: voucher } = await supabase.from('Voucher').select('*').eq('voucherID', voucherId).single();
        if (voucher) {
           let discount = voucher.type === 'PERCENT' ? (totalAmount * voucher.discountValue) / 100 : voucher.discountValue;
           finalAmount = Math.max(0, totalAmount - discount);
           
           // Trừ usageLimit của Voucher
           if (voucher.usageLimit > 0) {
             await supabase.from('Voucher').update({ usageLimit: voucher.usageLimit - 1 }).eq('voucherID', voucherId);
           }
        }
      }
      
      const { data: newOrder, error: orderError } = await supabase
        .from('Order')
        .insert([{
          orderDate: new Date(),
          totalAmount,
          finalAmount,
          status: 'Chờ thanh toán', // Trạng thái mặc định ban đầu
          idCustomer: customerId,
          idAddress: addressId,
          idPayment: paymentId,
          idShipment: shipmentId,
          idVoucher: voucherId || null
        }])
        .select('orderID')
        .single();
      
      if (orderError) throw orderError;

      const orderItemsToInsert = cartItems.map(item => ({
        idOrder: newOrder.orderID,
        idBook: item.idBook,
        quantity: item.quantity
      }));

      const { error: insertItemsError } = await supabase.from('OrderItem').insert(orderItemsToInsert);
      if (insertItemsError) throw insertItemsError;

      await supabase.from('CartItem').delete().eq('idCart', cart.cartID);

      res.status(200).json({ message: "Đặt hàng thành công!", orderID: newOrder.orderID });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 2. Mua Ngay (Bỏ qua Giỏ hàng)
  buyNow: async (req, res) => {
    const { customerId, bookId, quantity, addressId, paymentId, shipmentId, voucherId } = req.body;

    try {
      const { data: book } = await supabase.from('Book').select('price').eq('bookID', bookId).single();
      if (!book) return res.status(404).json({ message: "Không tìm thấy sách" });

      let totalAmount = book.price * quantity;
      let finalAmount = totalAmount;

      // Xử lý Voucher nếu CÓ
      if (voucherId) {
        const { data: voucher } = await supabase.from('Voucher').select('*').eq('voucherID', voucherId).single();
        if (voucher) {
           let discount = voucher.type === 'PERCENT' ? (totalAmount * voucher.discountValue) / 100 : voucher.discountValue;
           finalAmount = Math.max(0, totalAmount - discount);
           
           if (voucher.usageLimit > 0) {
             await supabase.from('Voucher').update({ usageLimit: voucher.usageLimit - 1 }).eq('voucherID', voucherId);
           }
        }
      }

      const { data: newOrder, error: orderError } = await supabase
        .from('Order')
        .insert([{
          orderDate: new Date(),
          totalAmount,
          finalAmount,
          status: 'Chờ thanh toán',
          idCustomer: customerId,
          idAddress: addressId,
          idPayment: paymentId,
          idShipment: shipmentId,
          idVoucher: voucherId || null
        }])
        .select('orderID')
        .single();
      
      if (orderError) throw orderError;

      const { error: insertItemsError } = await supabase.from('OrderItem').insert([{
        idOrder: newOrder.orderID,
        idBook: bookId,
        quantity: quantity
      }]);
      if (insertItemsError) throw insertItemsError;

      res.status(200).json({ message: "Mua hàng thành công!", orderID: newOrder.orderID });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 3. Xem danh sách đơn hàng (Có hỗ trợ lọc theo status nếu client gửi query: ?status=Chờ thanh toán)
  getOrderHistory: async (req, res) => {
    const { customerId, status } = req.query;

    try {
      let query = supabase.from('Order')
        .select('orderID, orderDate, finalAmount, status, OrderItem (quantity, Book(title, BookImages(imageURL)))')
        .eq('idCustomer', customerId)
        .order('orderDate', { ascending: false });

      if (status) query = query.eq('status', status);

      const { data: orders, error } = await query;

      if (error) throw error;
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 4. Xem chi tiết đơn hàng
  getOrderDetail: async (req, res) => {
    const { orderId } = req.params;

    try {
      const { data: order, error } = await supabase.from('Order')
        .select(`
          orderID, orderDate, totalAmount, finalAmount, status,
          Address (receiverName, addressString),
          Payment (paymentMethod),
          Shipment (shipmentMethod, estimatedDate),
          Voucher (code, discountValue, type),
          OrderItem (quantity, Book(bookID, title, price, BookImages(imageURL)))
        `)
        .eq('orderID', orderId)
        .single();

      if (error || !order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
      res.status(200).json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 5. Hủy đơn hàng
  cancelOrder: async (req, res) => {
    const { orderId } = req.params;
    
    try {
      const { data: order } = await supabase.from('Order').select('status, idVoucher').eq('orderID', orderId).single();
      if (!order) return res.status(404).json({ message: "Đơn hàng không tồn tại" });
      
      if (order.status !== 'Chờ thanh toán' && order.status !== 'Đang xử lý') {
        return res.status(400).json({ message: "Chỉ có thể hủy đơn hàng 'Chờ thanh toán' hoặc 'Đang xử lý'" });
      }

      const { data, error } = await supabase.from('Order').update({ status: 'Đã hủy' }).eq('orderID', orderId).select().single();
      if (error) throw error;

      // Cộng lại Voucher nếu có
      if (order.idVoucher) {
         const { data: voucher } = await supabase.from('Voucher').select('usageLimit').eq('voucherID', order.idVoucher).single();
         if (voucher) {
            await supabase.from('Voucher').update({ usageLimit: voucher.usageLimit + 1 }).eq('voucherID', order.idVoucher);
         }
      }

      res.status(200).json({ message: "Đã hủy đơn hàng thành công", data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = orderController;