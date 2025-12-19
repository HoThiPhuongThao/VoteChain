# VoteChain dApp

VoteChain là một ứng dụng phi tập trung (dApp) bỏ phiếu công bằng và minh bạch được xây dựng trên blockchain Sui.
Ứng dụng cho phép người dùng tham gia bỏ phiếu trực tiếp bằng ví Sui, trong đó mỗi địa chỉ ví chỉ được bỏ phiếu một lần, cơ chế này được thực thi hoàn toàn bởi smart contract on-chain.
Link website: https://vote-chain-one.vercel.app/
# Link youtube giới thiệu và hướng dẫn sử dụng
https://youtu.be/1yYRMkSOpRk
# Link prototype
https://www.figma.com/design/nUO4j4wsQKVQGFpci6HpMf/Web3?node-id=0-1&p=f&t=0gHunN4ITXXLp1GH-0
# Tính năng
Bỏ phiếu phi tập trung
Toàn bộ logic bỏ phiếu được xử lý bởi smart contract trên Sui, đảm bảo dữ liệu không thể bị chỉnh sửa hay gian lận.

Mỗi ví chỉ bỏ phiếu một lần
Smart contract sử dụng tx_context::sender để xác định địa chỉ ví và lưu trạng thái vào bảng voted, ngăn chặn việc bỏ phiếu nhiều lần ở mức blockchain.

Minh bạch và kiểm chứng được
Số phiếu của từng lựa chọn được lưu trữ on-chain, cho phép bất kỳ ai cũng có thể kiểm tra kết quả.

Ghi nhận sự kiện (Event)
Mỗi lần bỏ phiếu thành công sẽ phát ra sự kiện VoteEvent, hỗ trợ frontend và bên thứ ba theo dõi lịch sử bỏ phiếu.

Xây dựng bằng Vite + React
Ứng dụng web nhẹ, tốc độ cao, được xây dựng bằng React và Vite, tích hợp Sui Wallet thông qua @mysten/dapp-kit.

# Quy trình bỏ phiếu
1. Khởi tạo trạng thái bỏ phiếu

Hệ thống khởi tạo một đối tượng VoteState trên mạng Sui, bao gồm:

Danh sách các lựa chọn

Số phiếu của từng lựa chọn

Danh sách các địa chỉ ví đã bỏ phiếu

2. Tham gia bỏ phiếu

Người dùng kết nối ví Sui và chọn một lựa chọn để bỏ phiếu.
Giao dịch được gửi trực tiếp lên blockchain.

3. Ghi nhận phiếu bầu

Khi giao dịch hợp lệ:

Smart contract kiểm tra ví đã bỏ phiếu hay chưa

Số phiếu của lựa chọn được tăng

Địa chỉ ví được đánh dấu là đã bỏ phiếu

Một VoteEvent được phát ra

4. Xem kết quả

Người dùng có thể xem kết quả bỏ phiếu trực tiếp trên dApp.
Dữ liệu được truy xuất từ blockchain Sui, đảm bảo minh bạch và chính xác.
# Smart Contract

Logic cốt lõi của VoteChain được xây dựng bằng Sui Move.

Mã nguồn smart contract tại:

contracts/votechain/sources/vote.move

Các hàm chính

init_vote_state: Khởi tạo trạng thái bỏ phiếu

vote: Ghi nhận phiếu bầu và đảm bảo mỗi ví chỉ bỏ phiếu một lần
# Bắt đầu sử dụng
Yêu cầu
Node.js (khuyến nghị >= 18)
npm hoặc yarn
Sui Wallet extension trên trình duyệt
Một ít SUI (Testnet)
# Cấu hình & Chạy với Vite + React
Cài đặt dependencies
npm install
# Cấu hình môi trường
Ứng dụng sử dụng Vite, các biến môi trường được cấu hình thông qua file .env.
# Chạy server phát triển
npm run dev


Ứng dụng sẽ chạy tại:

Website:http://localhost:5173
# Build production
npm run build


Thư mục output sau khi build:

dist/
# Preview bản build
npm run preview
# Lưu ý khi tích hợp Sui Wallet
Người dùng phải kết nối Sui Wallet trước khi bỏ phiếu
Frontend sử dụng @mysten/dapp-kit để gửi giao dịch
Toàn bộ kiểm tra hợp lệ được xử lý on-chain, frontend chỉ hiển thị trạng thái
# Triển khai
Ứng dụng frontend sử dụng Vite + React, triển khai dễ dàng bằng:
- Vercel
