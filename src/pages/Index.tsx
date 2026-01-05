import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Shield, Lock } from "lucide-react";
import { PasswordCard } from "@/components/PasswordCard";
import { PasswordForm } from "@/components/PasswordForm";
import { SearchBar } from "@/components/SearchBar";
import { useToast } from "@/hooks/use-toast";
import { usePasswords } from "@/hooks/use-passwords";
import heroImage from "@/assets/password-hero.png";

// Sử dụng interface PasswordEntry từ module db
import { PasswordEntry } from "@/lib/db/db";

const Index = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<PasswordEntry | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  
  // Sử dụng hook usePasswords để quản lý dữ liệu mật khẩu
  const {
    passwords,
    loading,
    error,
    stats,
    searchPasswords,
    addPassword,
    updatePassword,
    deletePassword
  } = usePasswords();

  // Tìm kiếm mật khẩu khi searchQuery thay đổi
  useMemo(() => {
    searchPasswords(searchQuery);
  }, [searchQuery, searchPasswords]);
  
  // Sử dụng passwords trực tiếp từ hook usePasswords
  const filteredPasswords = passwords;

  const handleSave = useCallback(async (entryData: Omit<PasswordEntry, "id" | "createdAt" | "updatedAt">) => {
    try {
      if (editEntry) {
        await updatePassword(editEntry.id, entryData);
      } else {
        await addPassword(entryData);
      }
      setEditEntry(undefined);
    } catch (err) {
      console.error('Lỗi khi lưu mật khẩu:', err);
    }
  }, [editEntry, updatePassword, addPassword]);

  const handleEdit = useCallback((entry: PasswordEntry) => {
    setEditEntry(entry);
    setIsFormOpen(true);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deletePassword(id);
    } catch (err) {
      console.error('Lỗi khi xóa mật khẩu:', err);
    }
  }, [deletePassword]);

  const openAddForm = useCallback(() => {
    setEditEntry(undefined);
    setIsFormOpen(true);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="glass-effect sticky top-0 z-50 border-b border-border/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-primary pulse-glow">
                <Shield className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gradient">Memory Safe Guard</h1>
                <p className="text-muted-foreground font-medium">Quản lý mật khẩu an toàn & hiện đại</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={openAddForm} 
                variant="default" 
                className="gap-2 shadow-button hover:shadow-glow transition-all duration-300 px-6 py-3"
              >
                <Plus className="w-5 h-5" />
                Thêm mật khẩu
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">

        <div className="text-center mb-12 animate-fade-in">
          <div className="mx-auto mb-8 w-full max-w-2xl relative">
            <div className="absolute inset-0 bg-gradient-hero rounded-xl blur-3xl opacity-30"></div>
            <img 
              src={heroImage} 
              alt="Password Security" 
              className="w-full h-auto rounded-xl shadow-glow relative z-10 hover-lift"
            />
          </div>
          <h2 className="text-5xl font-bold mb-4 text-gradient leading-tight">
            Bảo vệ mật khẩu của bạn
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto text-lg leading-relaxed">
            Lưu trữ và quản lý tất cả mật khẩu của bạn một cách an toàn với công nghệ bảo mật hiện đại. 
            <br />
            <span className="text-accent font-medium">Không bao giờ quên mật khẩu nữa!</span>
          </p>
        </div>

        {/* Search */}
        <div className="max-w-lg mx-auto mb-12">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="glass-effect rounded-xl p-6 text-center hover-lift group">
            <div className="p-3 rounded-lg bg-gradient-primary w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Lock className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.total}</div>
            <div className="text-muted-foreground font-medium">Mật khẩu đã lưu</div>
          </div>
          <div className="glass-effect rounded-xl p-6 text-center hover-lift group">
            <div className="p-3 rounded-lg bg-gradient-accent w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-8 h-8 text-accent-foreground" />
            </div>
            <div className="text-3xl font-bold mb-1 text-gradient">100%</div>
            <div className="text-muted-foreground font-medium">Bảo mật tuyệt đối</div>
          </div>
          <div className="glass-effect rounded-xl p-6 text-center hover-lift group">
            <div className="p-3 rounded-lg bg-security/20 border border-security/30 w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Plus className="w-8 h-8 text-security" />
            </div>
            <div className="text-3xl font-bold mb-1 text-security">∞</div>
            <div className="text-muted-foreground font-medium">Không giới hạn</div>
          </div>
        </div>

        {/* Password Grid */}
        {loading ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="p-4 rounded-full bg-muted/20 w-fit mx-auto mb-6 animate-pulse">
              <Lock className="w-20 h-20 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gradient">
              Đang tải dữ liệu...
            </h3>
          </div>
        ) : error ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="p-4 rounded-full bg-destructive/20 w-fit mx-auto mb-6">
              <Lock className="w-20 h-20 text-destructive" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gradient">
              Lỗi khi tải dữ liệu
            </h3>
            <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">
              {error}
            </p>
          </div>
        ) : filteredPasswords.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPasswords.map((entry, index) => (
              <div 
                key={entry.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <PasswordCard
                  entry={entry}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 animate-fade-in">
            <div className="p-4 rounded-full bg-muted/20 w-fit mx-auto mb-6">
              <Lock className="w-20 h-20 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gradient">
              {searchQuery ? "Không tìm thấy kết quả" : "Chưa có mật khẩu nào"}
            </h3>
            <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">
              {searchQuery
                ? "Thử tìm kiếm với từ khóa khác hoặc kiểm tra lại chính tả"
                : "Bắt đầu bảo vệ tài khoản của bạn bằng cách thêm mật khẩu đầu tiên"}
            </p>
            {!searchQuery && (
              <Button 
                onClick={openAddForm} 
                variant="default" 
                className="shadow-button hover:shadow-glow transition-all duration-300 px-8 py-3"
              >
                <Plus className="w-5 h-5 mr-2" />
                Thêm mật khẩu đầu tiên
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Form Modal */}
      <PasswordForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        editEntry={editEntry}
      />
    </div>
  );
};

export default Index;