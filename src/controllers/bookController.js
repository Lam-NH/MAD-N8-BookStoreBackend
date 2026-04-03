const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'bookstore_secret_dev';

const bookController = {
  // 1. Trả về tất cả danh mục
  getCategories: async (req, res) => {
    try {
      const { data, error } = await supabase.from('Categories').select('*');
      if (error) throw error;
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 2. Trả về tất cả sách (có phân trang 20, lọc theo danh mục)
  getBooks: async (req, res) => {
    let { page = 1, limit = 20, categoryId } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    try {
      let query = supabase.from('Book').select('*, BookImages(imageURL)', { count: 'exact' }).range(from, to);
      
      if (categoryId) {
        const { data: bcData } = await supabase.from('BookCategory').select('idBook').eq('idCategory', categoryId);
        if (bcData && bcData.length > 0) {
          const bookIds = bcData.map(b => b.idBook);
          query = query.in('bookID', bookIds);
        } else {
          return res.status(200).json({ data: [], pagination: { total_items: 0, total_pages: 0, current_page: page, items_per_page: limit } });
        }
      }

      const { data, count, error } = await query;
      if (error) throw error;

      res.status(200).json({
        data: data.map(b => ({ ...b, price: b.price * 100000 })),
        pagination: { total_items: count, total_pages: Math.ceil(count / limit), current_page: page, items_per_page: limit }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 3. Lấy sách Dành riêng cho bạn (Top 20 mới nhất / ngẫu nhiên)
  getBooksForYou: async (req, res) => {
    try {
      const { data, error } = await supabase.from('Book')
        .select('*, BookImages(imageURL)')
        .order('createdAt', { ascending: false })
        .limit(20);
      if (error) throw error;
      res.status(200).json(data.map(b => ({ ...b, price: b.price * 100000 })));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 4. Chi tiết sách (kéo theo giá, mô tả, rating, 3 review, 12 sách tương tự)
  // Tự động Ghi Lịch sử Xem
  getBookDetail: async (req, res) => {
    const { id } = req.params;
    try {
      // Thông tin cơ bản
      const { data: book, error: bookError } = await supabase.from('Book').select('*, BookImages(imageURL)').eq('bookID', id).single();
      if (bookError || !book) return res.status(404).json({ message: "Không tìm thấy sách" });

      // Lấy rating và 3 review gần nhất
      const { data: reviews } = await supabase.from('Review')
        .select('rating, comment, Customer(fullName)')
        .eq('idBook', id)
        .order('reviewID', { ascending: false });
        
      let avgRating = 0;
      let top3Reviews = [];
      if (reviews && reviews.length > 0) {
        avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        top3Reviews = reviews.slice(0, 3);
      }

      // Sách tương tự (cùng nhóm hoặc ngẫu nhiên cập nhật gần đây)
      let similarBooks = [];
      if (book.idGroup) {
        const { data: sb } = await supabase.from('Book').select('*, BookImages(imageURL)').eq('idGroup', book.idGroup).neq('bookID', id).limit(12);
        similarBooks = sb || [];
      } else {
        const { data: sb } = await supabase.from('Book').select('*, BookImages(imageURL)').neq('bookID', id).order('updatedAt', { ascending: false }).limit(12);
        similarBooks = sb || [];
      }

      // Tự động Add ViewHistory nếu truyền Token Header hợp lệ
      const authHeader = req.headers.authorization;
      if (authHeader) {
        const token = authHeader.split(' ')[1];
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          await supabase.from('ViewHistory').insert([{ viewAt: new Date(), idBook: id, idCustomer: decoded.customerID }]);
        } catch (e) {
          // Bỏ qua nếu lỗi token (vẫn cho xem sách nhưng ko ghi log)
        }
      }

      book.price = book.price * 100000;
      res.status(200).json({ book, avgRating, totalReviews: reviews ? reviews.length : 0, top3Reviews, similarBooks: similarBooks.map(b => ({ ...b, price: b.price * 100000 })) });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  searchBooks: async (req, res) => {
    let { q, page = 1, limit = 20 } = req.query;
    if (!q) return res.status(400).json({ message: "Vui lòng nhập từ khóa q" });
    
    page = parseInt(page);
    limit = parseInt(limit);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    try {
      // Ưu tiên 1: Tìm xem q có khớp với Tên Tác Giả không
      const { data: matchedAuthors } = await supabase.from('Authors').select('*').ilike('authorName', `%${q}%`).limit(1);
      
      if (matchedAuthors && matchedAuthors.length > 0) {
        const author = matchedAuthors[0];
        const { data: abcData } = await supabase.from('BookAuthor').select('idBook').eq('idAuthor', author.authorID);
        
        let bookData = [];
        let count = 0;
        
        if (abcData && abcData.length > 0) {
            const bookIds = abcData.map(b => b.idBook);
            const { data, count: exactCount } = await supabase.from('Book')
              .select('*, BookImages(imageURL)', { count: 'exact' })
              .in('bookID', bookIds)
              .range(from, to);
             bookData = data.map(b => ({ ...b, price: b.price * 100000 }));
             count = exactCount;
        }

        return res.status(200).json({
          authorMatch: author,
          data: bookData,
          pagination: { total_items: count, total_pages: Math.ceil((count||0) / limit), current_page: page, items_per_page: limit }
        });
      }

      // Ưu tiên 2 & 3: Tìm xem q có khớp Danh Mục hoặc Tên Sách không
      const { data: matchedCategories } = await supabase.from('Categories').select('categoryID').ilike('categoryName', `%${q}%`);
      let categoryIds = matchedCategories ? matchedCategories.map(c => c.categoryID) : [];
      let bookIdsFromCategory = [];
      
      if (categoryIds.length > 0) {
          const { data: bcData } = await supabase.from('BookCategory').select('idBook').in('idCategory', categoryIds);
          bookIdsFromCategory = bcData ? bcData.map(b => b.idBook) : [];
      }

      let query = supabase.from('Book').select('*, BookImages(imageURL)', { count: 'exact' });
      
      if (bookIdsFromCategory.length > 0) {
        const idsString = `(${bookIdsFromCategory.join(',')})`;
        query = query.or(`title.ilike.%${q}%,bookID.in.${idsString}`);
      } else {
        query = query.ilike('title', `%${q}%`);
      }

      const { data, count, error } = await query.range(from, to);
      if (error) throw error;

      res.status(200).json({
        data: data.map(b => ({ ...b, price: b.price * 100000 })),
        pagination: { total_items: count, total_pages: Math.ceil(count / limit), current_page: page, items_per_page: limit }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 6. Trả về chi tiết Tác giả
  getAuthorDetail: async (req, res) => {
    const { id } = req.params;
    try {
      const { data, error } = await supabase.from('Authors').select('*').eq('authorID', id).single();
      if (error) throw error;
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 7. Sách theo tác giả
  getBooksByAuthor: async (req, res) => {
    const { id } = req.params;
    try {
      const { data: abcData } = await supabase.from('BookAuthor').select('idBook').eq('idAuthor', id);
      if (!abcData || abcData.length === 0) return res.status(200).json([]);
      
      const bookIds = abcData.map(b => b.idBook);
      const { data, error } = await supabase.from('Book').select('*, BookImages(imageURL)').in('bookID', bookIds);
      if (error) throw error;
      res.status(200).json(data.map(b => ({ ...b, price: b.price * 100000 })));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 8. Sách theo Nhà xuất bản
  getBooksByPublisher: async (req, res) => {
    const { id } = req.params;
    try {
      const { data: pubData } = await supabase.from('BookPublisher').select('idBook').eq('idPublisher', id);
      if (!pubData || pubData.length === 0) return res.status(200).json([]);
      
      const bookIds = pubData.map(b => b.idBook);
      const { data, error } = await supabase.from('Book').select('*, BookImages(imageURL)').in('bookID', bookIds);
      if (error) throw error;
      res.status(200).json(data.map(b => ({ ...b, price: b.price * 100000 })));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = bookController;