import React, { useState, useEffect } from "react";
import { TransactionBlock } from "@mysten/sui.js/transactions";

import {
  useCurrentAccount,
  useSignAndExecuteTransactionBlock,
  useSuiClient,
  ConnectButton,
} from "@mysten/dapp-kit";

import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

import {
  Vote,
  Lock,
  Globe,
  Plus,
  User,
  LogOut,
  Home,
  Image,
  Crown,
  Award,
  ChevronLeft,
  History,
} from "lucide-react";

const PACKAGE_ID =
  "0x4b0339de091f14c63f308176314c588226e156932d91f61cf2d029809f19fd47";
const REGISTRY_ID =
  "0x1dbf237ac5cc81127ed0fc0e34d64aaa5e78d0abdc325d1243a0fa1cd2ceb51a";
const VOTE_STATE_ID =
  "0x1eda052830540a051a9b4bba81726de67567a66a5ae8493c28606531e641f796";
//const SUI_PASS_OBJECT_ID ='0x6ccc9c8789656618bcc3bbdb147d1c65900fbd48946b1345c62adc0079a8a32b';

const VoteChainApp = () => {
  const [hasPass, setHasPass] = useState(false);
  const [isMinting, setIsMinting] = useState(false);

  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransactionBlock();

  const generateEventCode = () =>
    Math.random().toString(36).substring(2, 8).toUpperCase();

  const [joinCode, setJoinCode] = useState("");

  const [showHistory, setShowHistory] = useState(false);
  const [selectedOptionHistory, setSelectedOptionHistory] = useState([]);
  const [selectedOptionName, setSelectedOptionName] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);

  const suiClient = useSuiClient();
  const [voteHistory, setVoteHistory] = useState([]);

  const [currentUser, setCurrentUser] = useState(null);

  const [page, setPage] = useState("login");

  const [selectedEvent, setSelectedEvent] = useState(null);

  const [loginForm, setLoginForm] = useState({ username: "", password: "" });

  const [registerForm, setRegisterForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [isRegister, setIsRegister] = useState(false);

  const [walletAddress, setWalletAddress] = useState(null);

  const connectWallet = () => {
    if (!currentAccount?.address) {
      alert("Hãy bấm Connect Wallet trước");
      return;
    }
    setWalletAddress(currentAccount.address);
  };

  const getUserSuiPass = async () => {
    const objects = await suiClient.getOwnedObjects({
      owner: currentAccount.address,
      options: { showType: true },
    });

    const pass = objects.data.find((o) =>
      o.data?.type?.includes("::sui_pass::SuiPass")
    );

    if (!pass) throw new Error("Bạn chưa có SUI PASS");

    return pass.data.objectId;
  };
  const checkUserHasPass = async () => {
    if (!currentAccount?.address) return;

    try {
      await getUserSuiPass();
      setHasPass(true);
    } catch {
      setHasPass(false);
    }
  };
  useEffect(() => {
    if (currentAccount?.address) {
      checkUserHasPass();
    }
  }, [currentAccount]);

  useEffect(() => {
    if (selectedEvent) {
      fetchVoteHistory().then(setVoteHistory);
    }
  }, [selectedEvent]);

  useEffect(() => {
    if (!currentAccount?.address) {
      // 🔥 RESET TOÀN BỘ STATE VÍ
      setWalletAddress(null);
      setHasPass(false);
    } else {
      setWalletAddress(currentAccount.address);
      checkUserHasPass();
    }
  }, [currentAccount]);

  const [users, setUsers] = useState([
    { id: 1, username: "user1", password: "123456" },

    { id: 2, username: "user2", password: "123456" },
  ]);

  const [publicEvents, setPublicEvents] = useState([
    {
      id: 1,

      title: "Bầu chọn ca sĩ khách mời cho sự kiện  Hòa Sắc",

      description:
        "Hãy bình chọn cho ca sĩ khách mời mà bạn thích sẽ đồng hành với Hòa Sắc",

      category: "HÒA SẮC",

      isPublic: true,

      creatorId: 1,

      hideResults: false,

      options: [
        {
          id: 1,
          text: "Sơn Tùng M-TP",
          subtitle: "MS001",
          votes: 40025,
          image:
            "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&h=500&fit=crop",
        },

        {
          id: 2,
          text: "Hòa Minzy",
          subtitle: "MS022",
          votes: 34145,
          image:
            "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=500&fit=crop",
        },

        {
          id: 3,
          text: "Đen Vâu",
          subtitle: "MS003",
          votes: 25450,
          image:
            "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=500&fit=crop",
        },
      ],
    },
  ]);

  const [privateEvents, setPrivateEvents] = useState([
    {
      id: 3,

      title: "Chọn địa điểm du lịch cuối tuần",

      description: "Team mình đi đâu cuối tuần này?",

      category: "DU LỊCH NỘI ĐỊA",

      isPublic: false,

      creatorId: 1,

      hideResults: false,

      invitedUsers: [1, 2],

      options: [
        {
          id: 1,
          text: "Đà Lạt",
          subtitle: "THÀNH PHỐ NGÀN HOA",
          votes: 2000,
          image:
            "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=500&fit=crop",
        },

        {
          id: 2,
          text: "Vũng Tàu",
          subtitle: "THÀNH PHỐ BIỂN",
          votes: 3000,
          image:
            "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=500&fit=crop",
        },
      ],
    },
  ]);
  const fetchVotesFromChain = async () => {
    try {
      const res = await suiClient.getObject({
        id: VOTE_STATE_ID,
        options: { showContent: true },
      });

      const fields = res.data.content.fields;
      const optionVotesTableId = fields.option_votes.fields.id.id;

      // đọc toàn bộ bảng option_votes
      const table = await suiClient.getDynamicFields({
        parentId: optionVotesTableId,
      });

      const votesMap = {};

      for (const item of table.data) {
        const detail = await suiClient.getObject({
          id: item.objectId,
          options: { showContent: true },
        });

        const { name, value } = detail.data.content.fields;
        votesMap[Number(name)] = Number(value);
      }

      // cập nhật UI
      setPublicEvents((prev) =>
        prev.map((ev) => ({
          ...ev,
          options: ev.options.map((opt) => ({
            ...opt,
            votes: votesMap[opt.id] ?? opt.votes,
          })),
        }))
      );
    } catch (e) {
      console.error("❌ fetchVotesFromChain error", e);
    }
  };

  useEffect(() => {
    fetchVotesFromChain();
  }, [suiClient]);

  const [newEvent, setNewEvent] = useState({
    title: "",

    description: "",

    category: "",

    isPublic: true,

    hideResults: false,

    endDate: "",

    options: [
      { text: "", subtitle: "", image: "" },

      { text: "", subtitle: "", image: "" },
    ],

    invitedUsernames: "",
  });
  const handleGoogleLogin = (credential) => {
    try {
      const decoded = jwtDecode(credential);

      const googleUser = {
        id: 999, // user Google (off-chain)
        username: decoded.email || decoded.name || "google-user",
      };

      setCurrentUser(googleUser);
      setPage("home");
      setShowWelcome(true);
      setIsRegister(false);
    } catch (err) {
      console.error(err);
      alert("❌ Google login lỗi");
    }
  };

  const handleLogin = () => {
    const user = users.find(
      (u) =>
        u.username === loginForm.username && u.password === loginForm.password
    );

    if (user) {
      setCurrentUser(user);

      setPage("home");
      setShowWelcome(true); // 👈 THÊM DÒNG NÀY

      setLoginForm({ username: "", password: "" });
    } else {
      alert("Tên đăng nhập hoặc mật khẩu không đúng!");
    }
  };

  const handleRegister = () => {
    if (registerForm.password !== registerForm.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");

      return;
    }

    if (users.find((u) => u.username === registerForm.username)) {
      alert("Tên đăng nhập đã tồn tại!");

      return;
    }

    const newUser = {
      id: users.length + 1,

      username: registerForm.username,

      password: registerForm.password,
    };

    setUsers([...users, newUser]);

    setCurrentUser(newUser);

    setPage("home");

    setRegisterForm({ username: "", password: "", confirmPassword: "" });
  };
  const handleMintPass = async () => {
    if (!currentAccount?.address) {
      alert("Vui lòng connect ví trước");
      return;
    }

    setIsMinting(true);

    try {
      const tx = new TransactionBlock();

      tx.moveCall({
        target: `${PACKAGE_ID}::sui_pass::mint`,
        arguments: [
          tx.object(REGISTRY_ID), // SuiPassRegistry
        ],
      });

      signAndExecute(
        { transactionBlock: tx },
        {
          onSuccess: async () => {
            alert("🎉 Mint SUI PASS thành công!");
            await checkUserHasPass();
          },
          onError: (err) => {
            console.error(err);
            alert("❌ Mint thất bại hoặc bạn đã có SUI PASS");
          },
        }
      );
    } finally {
      setIsMinting(false);
    }
  };

  const fetchVoteHistory = async () => {
    const events = await suiClient.queryEvents({
      query: {
        MoveEventType: `${PACKAGE_ID}::vote::VoteEvent`,
      },
      limit: 100,
    });

    console.log("ALL EVENTS", events.data);

    return events.data.map((e) => ({
      voter: e.parsedJson.voter,
      optionId: Number(e.parsedJson.option_id),
      date: new Date(Number(e.timestampMs)).toLocaleDateString("vi-VN"),
    }));
  };

  const fetchHistoryByOption = async (optionId, optionName) => {
    const events = await suiClient.queryEvents({
      query: {
        MoveEventType: `${PACKAGE_ID}::vote::VoteEvent`,
      },
      limit: 200,
    });

    const filtered = events.data
      .filter((e) => Number(e.parsedJson.option_id) === optionId)
      .map((e) => ({
        voter: e.parsedJson.voter,
        date: new Date(Number(e.timestampMs)).toLocaleDateString("vi-VN"),
      }));

    setSelectedOptionHistory(filtered);
    setSelectedOptionName(optionName);
    setShowHistory(true);
  };

  const handleVote = async (optionId) => {
    if (selectedEvent?.endDate) {
      const now = new Date();
      const end = new Date(selectedEvent.endDate + "T23:59:59");

      if (now > end) {
        alert("⏰ Sự kiện đã kết thúc, không thể bình chọn");
        return;
      }
    }

    if (!currentAccount?.address) {
      alert("Bạn cần connect ví");
      return;
    }

    let passId;
    try {
      passId = await getUserSuiPass();
    } catch {
      alert("❌ Bạn chưa có SUI PASS");
      return;
    }

    const tx = new TransactionBlock();

    tx.moveCall({
      target: `${PACKAGE_ID}::vote::vote`,
      arguments: [
        tx.object(VOTE_STATE_ID), // VoteState (shared)
        tx.object(passId), // SuiPass
        tx.pure.u64(optionId), // option_id
      ],
    });

    if (!currentAccount?.address) {
      alert("Bạn cần connect ví Sui");
      return;
    }

    signAndExecute(
      { transactionBlock: tx },
      {
        onSuccess: async () => {
          // 1️⃣ Update publicEvents (list)
          setPublicEvents((prev) =>
            prev.map((ev) =>
              ev.id === selectedEvent.id
                ? {
                    ...ev,
                    options: ev.options.map((opt) =>
                      opt.id === optionId
                        ? { ...opt, votes: opt.votes + 1 }
                        : opt
                    ),
                  }
                : ev
            )
          );

          // 2️⃣ 🔥 UPDATE selectedEvent (detail – CÁI QUAN TRỌNG NHẤT)
          setSelectedEvent((prev) => {
            const updatedOptions = prev.options
              .map((opt) =>
                opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
              )
              .sort((a, b) => b.votes - a.votes);

            return { ...prev, options: updatedOptions };
          });

          // 3️⃣ Sync lại chain (optional nhưng nên có)
          await fetchVotesFromChain();

          alert("🎉 Vote on-chain thành công");
        },
      }
    );
  };

  const handleCreateEvent = () => {
    if (
      !newEvent.title ||
      newEvent.options.filter((o) => o.text.trim()).length < 2
    ) {
      alert("Vui lòng nhập tên sự kiện và ít nhất 2 lựa chọn!");

      return;
    }

    const event = {
      id: Date.now(),

      eventCode: newEvent.isPublic ? null : generateEventCode(),

      title: newEvent.title,

      description: newEvent.description,

      category: newEvent.category || "CHƯA PHÂN LOẠI",

      isPublic: newEvent.isPublic,

      hideResults: newEvent.hideResults,

      endDate: newEvent.endDate,

      creatorId: currentUser.id,

      options: newEvent.options

        .filter((o) => o.text.trim())

        .map((opt, idx) => ({
          id: idx + 1,

          text: opt.text,

          subtitle: opt.subtitle || "KHÔNG CÓ MÔ TẢ",

          image:
            opt.image ||
            "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&h=500&fit=crop",

          votes: 0,
        })),
    };

    if (!newEvent.isPublic) {
      const invitedUsernames = newEvent.invitedUsernames
        .split(",")
        .map((u) => u.trim());

      const invitedIds = users
        .filter((u) => invitedUsernames.includes(u.username))
        .map((u) => u.id);

      // đảm bảo người tạo luôn được mời
      if (!invitedIds.includes(currentUser.id)) {
        invitedIds.push(currentUser.id);
      }

      event.invitedUsers = invitedIds;
      setPrivateEvents([...privateEvents, event]);
    } else {
      setPublicEvents([...publicEvents, event]);
    }

    setNewEvent({
      title: "",

      description: "",

      category: "",

      isPublic: true,

      hideResults: false,

      options: [
        { text: "", subtitle: "", image: "" },
        { text: "", subtitle: "", image: "" },
      ],

      invitedUsernames: "",
    });

    setPage("home");

    alert("Tạo sự kiện thành công!");
  };

  const formatNumber = (num) => {
    return num.toLocaleString("en-US");
  };

  const handleDeleteEvent = (event) => {
    if (!window.confirm("Bạn có chắc muốn xóa sự kiện này không?")) return;

    if (event.isPublic) {
      setPublicEvents((prev) => prev.filter((e) => e.id !== event.id));
    } else {
      setPrivateEvents((prev) => prev.filter((e) => e.id !== event.id));
    }

    setSelectedEvent(null);
    alert("🗑️ Đã xóa sự kiện");
  };

  const getRankBadge = (rank) => {
    const badges = [
      { icon: Crown, color: "text-yellow-400", bg: "bg-yellow-50" },

      { icon: Award, color: "text-gray-400", bg: "bg-gray-100" },

      { icon: Award, color: "text-orange-400", bg: "bg-orange-50" },
    ];

    return badges[rank] || null;
  };

  const updateOption = (index, field, value) => {
    const opts = [...newEvent.options];

    opts[index][field] = value;

    setNewEvent({ ...newEvent, options: opts });
  };

  const renderEventDetail = (event, isPublic) => {
    const isCreator = event.creatorId === currentUser.id;

    const showResults = !event.hideResults || isCreator;

    const sortedOptions = [...event.options].sort((a, b) => b.votes - a.votes);

    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {showHistory && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-fade-in">
                <h3 className="text-2xl font-extrabold mb-4 flex items-center gap-2 text-black">
                  {selectedOptionName}
                </h3>
                <div className="flex justify-between text-sm font-bold text-black mb-3 px-1 border-b pb-1">
                  <span>ID ví</span>
                  <span>Ngày</span>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {selectedOptionHistory.length === 0 && (
                    <p className="text-gray-500 text-center">
                      Chưa có lượt bình chọn
                    </p>
                  )}

                  {selectedOptionHistory.map((v, i) => (
                    <div
                      key={i}
                      className="flex justify-between text-sm bg-gray-100 rounded-lg px-3 py-2"
                    >
                      <span>
                        {v.voter.slice(0, 6)}...{v.voter.slice(-4)}
                      </span>
                      <span className="text-gray-500">{v.date}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowHistory(false)}
                  className="mt-4 w-full bg-pink-500 text-white py-2 rounded-xl font-semibold hover:bg-pink-600"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setSelectedEvent(null)}
              className="flex items-center text-white"
            >
              <ChevronLeft className="w-6 h-6" />

              <span className="text-lg">Tất cả sự kiện</span>
            </button>

            {event.endDate && (
              <div className="text-center text-sm text-white/80 mb-4">
                ⏰ Kết thúc vào: <b>{event.endDate}</b>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Vote className="w-6 h-6 text-pink-100" />

              <span className="text-white font-bold text-lg">VoteChain</span>
            </div>
          </div>

          {!event.isPublic && isCreator && (
            <div className="bg-yellow-100 text-yellow-800 p-3 rounded-lg mb-4 text-sm">
              🔐 Mã mời sự kiện: <b>{event.eventCode}</b>
            </div>
          )}
          {isCreator && (
            <button
              onClick={() => handleDeleteEvent(event)}
              className="
            mb-4 w-full
            bg-red-500 text-white
            py-2 rounded-xl font-semibold
            hover:bg-red-600 transition
          "
            >
              🗑️ Xóa sự kiện
            </button>
          )}

          <div className="space-y-4">
            {sortedOptions.map((option, index) => {
              const total = event.options.reduce((s, o) => s + o.votes, 0);

              const pct = total > 0 ? (option.votes / total) * 100 : 0;

              const badge = getRankBadge(index);

              const isTop = index === 0;

              return (
                <div
                  key={option.id}
                  className={`bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden ${
                    isTop ? "ring-4 ring-yellow-400" : ""
                  }`}
                >
                  <div className="relative">
                    <img
                      src={option.image}
                      alt={option.text}
                      className="w-full h-64 object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  </div>

                  {showResults && (
                    <div className="px-6 py-4 bg-pink-600/60">
                      <div className="text-center mb-3">
                        <div className="text-4xl font-bold text-white">
                          {formatNumber(option.votes)}
                        </div>
                      </div>

                      <div className="relative h-2 bg-white/30 rounded-full overflow-hidden mb-3">
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-300 to-rose-400 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="px-6 py-4 bg-rose-600/80">
                    <div className="text-sm text-pink-100 mb-1">
                      {option.subtitle}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <h3 className="text-xl font-bold text-white">
                        {option.text}
                      </h3>

                      {badge && showResults && (
                        <div
                          className={`flex items-center justify-center w-12 h-12 rounded-full ${badge.bg}`}
                        >
                          <badge.icon className={`w-6 h-6 ${badge.color}`} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 p-4">
                    <button
                      onClick={() => handleVote(option.id)}
                      className="flex-1 bg-white text-pink-600 py-4 rounded-xl font-bold text-lg hover:bg-pink-50 transition shadow-lg shadow-lg hover:scale-101"
                    >
                      Bình chọn
                    </button>

                    {isCreator && (
                      <button
                        onClick={() =>
                          fetchHistoryByOption(option.id, option.text)
                        }
                        title="Xem lịch sử bình chọn"
                        className="
      w-14 h-14
      flex items-center justify-center
      bg-white
      text-pink-500
      rounded-xl
   shadow-lg hover:scale-105
      hover:bg-pink-50
      hover:text-pink-600
      transition
    "
                      >
                        <History className="w-6 h-6" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 text-center text-white/60 text-sm">
            {event.category}
          </div>
        </div>
      </div>
    );
  };

  const renderEventCard = (event, isPublic) => {
    const isCreator = event.creatorId === currentUser.id;

    const sortedOptions = [...event.options].sort((a, b) => b.votes - a.votes);

    const topOption = sortedOptions[0];

    return (
      <div
        key={event.id}
        onClick={() => setSelectedEvent(event)}
        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer"
      >
        <div className="relative">
          <img
            src={topOption.image}
            alt={topOption.text}
            className="w-full h-48 object-cover"
          />

          <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-medium">
            {event.options.length} lựa chọn
          </div>
        </div>

        <div className="p-5">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {event.title}
          </h3>

          <p className="text-gray-600 text-sm mb-3">{event.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm">
              {event.isPublic ? (
                <div className="flex items-center text-pink-500">
                  <Globe className="w-4 h-4 mr-1" />

                  <span>Công khai</span>
                </div>
              ) : (
                <div className="flex items-center text-rose-500">
                  <Lock className="w-4 h-4 mr-1" />

                  <span>Riêng tư</span>
                </div>
              )}

              {isCreator && (
                <div className="flex items-center text-pink-400">
                  <User className="w-4 h-4 mr-1" />

                  <span>Của bạn</span>
                </div>
              )}
            </div>

            <div className="text-pink-500 font-medium text-sm">
              Xem chi tiết →
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (selectedEvent) {
    const isPublic = publicEvents.some((e) => e.id === selectedEvent.id);

    return renderEventDetail(selectedEvent, isPublic);
  }

  if (page === "login") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-rose-400 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-5 sm:p-8">
          <div className="flex items-center justify-center mb-6">
            <Vote className="w-12 h-12 text-pink-500 mr-3" />

            <h1 className="text-3xl font-bold text-gray-800">VoteChain</h1>
          </div>

          {!isRegister ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-center mb-6">
                Đăng nhập
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên đăng nhập
                </label>

                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, username: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu
                </label>

                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-rose-600 transition shadow-md"
              >
                Đăng nhập
              </button>
              <GoogleLogin
                onSuccess={(res) => handleGoogleLogin(res.credential)}
                onError={() => alert("Google login failed")}
              />

              <p className="text-center text-sm text-gray-600">
                Chưa có tài khoản?{" "}
                <button
                  onClick={() => setIsRegister(true)}
                  className="text-pink-500 font-semibold hover:underline"
                >
                  Đăng ký ngay
                </button>
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-center mb-6">
                Đăng ký
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên đăng nhập
                </label>

                <input
                  type="text"
                  value={registerForm.username}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      username: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu
                </label>

                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      password: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Xác nhận mật khẩu
                </label>

                <input
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleRegister}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-rose-600 transition shadow-md"
              >
                Đăng ký
              </button>

              <p className="text-center text-sm text-gray-600">
                Đã có tài khoản?{" "}
                <button
                  onClick={() => setIsRegister(false)}
                  className="text-pink-500 font-semibold hover:underline"
                >
                  Đăng nhập
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 overflow-x-hidden">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-pink-500 to-rose-500 p-2 rounded-xl mr-3">
              <Vote className="w-6 h-6 text-white" />
            </div>

            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
              VoteChain
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-700">
              <User className="w-5 h-5" />

              <span className="font-medium">{currentUser?.username}</span>
            </div>

            <div className="flex flex-wrap gap-2 justify-end">
              {/* NÚT CONNECT CHUẨN CỦA SUI */}
              <ConnectButton />

              {/* NÚT MINT / TRẠNG THÁI SUI PASS */}
              {walletAddress && !hasPass && (
                <button
                  onClick={handleMintPass}
                  disabled={isMinting}
                  className={`px-4 py-2 rounded-lg font-semibold transition
                    ${
                      isMinting
                        ? "bg-gray-300 text-gray-500"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }
                `}
                >
                  {isMinting ? "Đang mint..." : "Mint SUI PASS"}
                </button>
              )}

              {walletAddress && hasPass && (
                <div
                  className="
              flex items-center gap-1.5
              px-3 py-1.5
              bg-green-50
              border border-green-200
              rounded-full
              text-green-600
              text-sm
              font-semibold
            "
                >
                  <span className="leading-none">✔</span>
                  <span>Đã có SUI PASS</span>
                </div>
              )}

              {/* NÚT ĐĂNG XUẤT USER */}
              <button
                onClick={() => {
                  setCurrentUser(null);
                  setPage("login");
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1">
            {[
              { key: "home", icon: Home, label: "Trang chủ" },

              { key: "create", icon: Plus, label: "Tạo sự kiện" },

              { key: "myEvents", icon: Lock, label: "Sự kiện của tôi" },
            ].map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setPage(key)}
                className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition ${
                  page === key
                    ? "border-pink-500 text-pink-500"
                    : "border-transparent text-gray-600 hover:text-gray-800"
                }`}
              >
                <Icon className="w-5 h-5" />

                <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {page === "home" && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Sự kiện công khai
            </h2>

            <p className="text-gray-600 mb-6">
              Tham gia bình chọn các sự kiện công khai
            </p>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {publicEvents.map((e) => renderEventCard(e, true))}
            </div>
          </div>
        )}

        {page === "create" && (
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8">
            <h2 className="text-3xl font-bold mb-6">Tạo sự kiện mới</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tên sự kiện *
                </label>

                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mô tả</label>

                <textarea
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Danh mục
                </label>

                <input
                  type="text"
                  value={newEvent.category}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, category: e.target.value })
                  }
                  placeholder="VD: KHOA THƯƠNG MẠI"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Ngày kết thúc bình chọn
                </label>
                <input
                  type="date"
                  value={newEvent.endDate}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, endDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg
               focus:ring-2 focus:ring-pink-400"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setNewEvent({ ...newEvent, isPublic: true })}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg border-2 transition ${
                    newEvent.isPublic
                      ? "border-pink-500 bg-pink-50 text-pink-500"
                      : "border-gray-300 text-gray-600"
                  }`}
                >
                  <Globe className="w-5 h-5" />

                  <span className="font-medium">Công khai</span>
                </button>

                <button
                  onClick={() => setNewEvent({ ...newEvent, isPublic: false })}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg border-2 transition ${
                    !newEvent.isPublic
                      ? "border-pink-500 bg-pink-50 text-pink-500"
                      : "border-gray-300 text-gray-600"
                  }`}
                >
                  <Lock className="w-5 h-5" />

                  <span className="font-medium">Riêng tư</span>
                </button>
              </div>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={newEvent.hideResults}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, hideResults: e.target.checked })
                  }
                  className="w-5 h-5 text-pink-500 rounded focus:ring-pink-400"
                />

                <div>
                  <span className="text-sm font-medium">
                    Ẩn kết quả bình chọn
                  </span>

                  <p className="text-xs text-gray-500">
                    Chỉ người tạo xem được
                  </p>
                </div>
              </label>

              {!newEvent.isPublic && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mời người dùng (ngăn cách bởi dấu phẩy)
                  </label>

                  <input
                    type="text"
                    value={newEvent.invitedUsernames}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        invitedUsernames: e.target.value,
                      })
                    }
                    placeholder="user1, user2"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-3">
                  Các lựa chọn *
                </label>

                {newEvent.options.map((opt, i) => (
                  <div
                    key={i}
                    className="mb-4 p-4 border border-pink-200 rounded-lg bg-pink-50/30"
                  >
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-pink-600">
                        Lựa chọn {i + 1}
                      </span>

                      {newEvent.options.length > 2 && (
                        <button
                          onClick={() =>
                            setNewEvent({
                              ...newEvent,
                              options: newEvent.options.filter(
                                (_, idx) => idx !== i
                              ),
                            })
                          }
                          className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
                        >
                          Xóa
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => updateOption(i, "text", e.target.value)}
                      placeholder="Tên lựa chọn"
                      className="w-full px-4 py-2 mb-2 border rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                    />

                    <input
                      type="text"
                      value={opt.subtitle}
                      onChange={(e) =>
                        updateOption(i, "subtitle", e.target.value)
                      }
                      placeholder="Phụ đề (VD: KHOA QUẢN HỆ CÔNG)"
                      className="w-full px-4 py-2 mb-2 border rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                    />

                    <div className="flex flex-col gap-2">
                      {/* 🔹 CHƯA CÓ ẢNH → HIỆN NÚT CHỌN */}
                      {!opt.image && (
                        <label
                          className="
        flex items-center justify-center gap-2
        px-4 py-3
        bg-gray-100
        text-pink-400
        font-semibold
        rounded-xl
        cursor-pointer
        border border-gray-300
        hover:bg-gray-200
        transition
      "
                        >
                          <Image className="w-5 h-5" />
                          Chọn ảnh từ máy
                          <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (!file) return;
                              const preview = URL.createObjectURL(file);
                              updateOption(i, "image", preview);
                            }}
                          />
                        </label>
                      )}

                      {/* 🔹 ĐÃ CÓ ẢNH → PREVIEW + NÚT XÓA */}
                      {opt.image && (
                        <div className="relative">
                          <img
                            src={opt.image}
                            alt="preview"
                            className="w-full h-40 object-cover rounded-lg border border-gray-200"
                          />

                          <button
                            type="button"
                            onClick={() => updateOption(i, "image", "")}
                            className="
          absolute top-2 right-2
          bg-red-500 text-white
          w-8 h-8
          rounded-full
          flex items-center justify-center
          hover:bg-red-600
          transition
        "
                            title="Xóa ảnh"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  onClick={() =>
                    setNewEvent({
                      ...newEvent,
                      options: [
                        ...newEvent.options,
                        { text: "", subtitle: "", image: "" },
                      ],
                    })
                  }
                  className="flex items-center space-x-2 px-4 py-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition"
                >
                  <Plus className="w-4 h-4" />

                  <span>Thêm lựa chọn</span>
                </button>
              </div>

              <button
                onClick={handleCreateEvent}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-rose-600 transition shadow-md"
              >
                Tạo sự kiện
              </button>
            </div>
          </div>
        )}

        {page === "myEvents" && (
          <div>
            <h2 className="text-3xl font-bold mb-2">Sự kiện của tôi</h2>

            <p className="text-gray-600 mb-6">
              Các sự kiện riêng tư mà bạn được mời
            </p>
            <div className="mb-6 bg-white p-4 rounded-xl shadow">
              <h3 className="font-bold mb-2">🔑 Tham gia sự kiện riêng tư</h3>
              <div className="flex gap-2">
                <input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="Nhập mã sự kiện"
                  className="flex-1 border rounded-lg px-3 py-2"
                />
                <button
                  onClick={() => {
                    const ev = privateEvents.find(
                      (e) => e.eventCode === joinCode
                    );
                    if (!ev) return alert("❌ Mã không hợp lệ");
                    if (!ev.invitedUsers.includes(currentUser.id)) {
                      ev.invitedUsers.push(currentUser.id);
                      setPrivateEvents([...privateEvents]);
                    }
                    alert("✅ Đã tham gia sự kiện");
                  }}
                  className="bg-pink-500 text-white px-4 rounded-lg"
                >
                  Tham gia
                </button>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {privateEvents
                .filter(
                  (e) =>
                    e.invitedUsers && e.invitedUsers.includes(currentUser.id)
                )
                .map((e) => renderEventCard(e, false))}
            </div>
          </div>
        )}
      </main>

      {showWelcome && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-fade-in">
            <h2 className="text-2xl font-extrabold text-pink-600 mb-2">
              🎉 Chào mừng đến với VoteChain
            </h2>

            <p className="text-gray-700 mb-4">
              VoteChain là nền tảng bình chọn sử dụng <b>Blockchain Sui</b>, đảm
              bảo <b>minh bạch – không gian lận – mỗi người chỉ 1 phiếu</b>.
            </p>

            <div className="space-y-3 text-sm text-gray-800">
              <div className="flex gap-2">
                <span className="font-bold text-pink-500">1.</span>
                <span>
                  <b>Connect Wallet</b> để kết nối ví Sui của bạn.
                </span>
              </div>

              <div className="flex gap-2">
                <span className="font-bold text-pink-500">2.</span>
                <span>
                  Sau khi connect, hệ thống sẽ <b>request quyền giao dịch</b>.
                </span>
              </div>

              <div className="flex gap-2">
                <span className="font-bold text-pink-500">3.</span>
                <span>
                  <b>Mint SUI PASS</b> – NFT định danh để đảm bảo mỗi người chỉ
                  vote 1 lần.
                </span>
              </div>

              <div className="flex gap-2">
                <span className="font-bold text-pink-500">4.</span>
                <span>
                  Khi đã có <b>SUI PASS</b>, bạn có thể{" "}
                  <b>bình chọn on-chain</b>.
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowWelcome(false)}
              className="mt-6 w-full bg-gradient-to-r from-pink-500 to-rose-500
                   text-white py-3 rounded-xl font-semibold
                   hover:from-pink-600 hover:to-rose-600 transition"
            >
              🚀 Đã hiểu, bắt đầu sử dụng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoteChainApp;
