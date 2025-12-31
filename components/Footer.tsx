export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 py-12 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                    {/* Company Info */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-900 text-lg">루미나</h3>
                        <div className="space-y-1 text-sm text-gray-500">
                            <p className="flex gap-2">
                                <span className="font-medium">대표자</span>
                                <span>노남주</span>
                            </p>
                            <p className="flex gap-2">
                                <span className="font-medium">사업자등록번호</span>
                                <span>752-47-01430</span>
                            </p>
                            <p className="flex gap-2">
                                <span className="font-medium">주소</span>
                                <span>경기도 화성시 동탄감배산로 143, 202동 19층 1901-35호</span>
                            </p>
                            <p className="flex gap-2">
                                <span className="font-medium">이메일</span>
                                <span>thedreamkorea.official@gmail.com</span>
                            </p>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="text-sm text-gray-400">
                        © 2025 Lumina. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
}
