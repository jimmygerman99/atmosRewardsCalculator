function openVenmo() {
    const appUrl = "venmo://paycharge?txn=pay&recipients=Jimmy-German-1&note=Atmos%20Rewards%20Calculator";
    const webUrl = "https://www.venmo.com/u/Jimmy-German-1";
    window.location.href = appUrl;
    setTimeout(() => {
        window.open(webUrl, "_blank", "noopener,noreferrer");
    }, 1500);
}

function openPayPal() {
    window.open("https://paypal.me/jimmygerman99", "_blank", "noopener,noreferrer");
}

function VenmoIcon() {
    return (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#3D95CE]" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.01 1.81c.45.74.65 1.5.65 2.48 0 3.1-2.64 7.13-4.79 9.96H10.2L8.27 2.96l4.64-.44 1.01 8.11c.95-1.55 2.12-3.99 2.12-5.66 0-.91-.16-1.53-.41-2.04l3.38-.92z" />
        </svg>
    );
}

function PayPalIcon() {
    return (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#003087]" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.02 21.97L7.7 17.9H5.75l1.04-6.57h3.92c1.47 0 2.54.31 3.2.92.66.6.86 1.5.6 2.7-.16.74-.45 1.36-.88 1.86-.43.5-.97.87-1.62 1.1-.65.24-1.4.36-2.25.36H8.7l-.45 2.83-1.23 1.87zM9.8 4.03h3.91c1.82 0 3.16.38 4.01 1.13.85.75 1.12 1.85.81 3.29-.2.92-.57 1.7-1.11 2.34-.54.64-1.23 1.11-2.06 1.4-.83.3-1.79.44-2.88.44H10.4L9.8 4.03z" />
        </svg>
    );
}

export default function SupportFooter() {
    return (
        <>
            <div className="mt-10 pb-10">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-slate-900/20 p-6 text-center">
                    <p className="text-2xl mb-2">☕</p>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Enjoy the calculator?</p>
                    <p className="text-xs text-gray-500 mb-5 max-w-sm mx-auto">
                        Recent college grad that's broke. Would greatly appreciate a coffee or drink! Tell me what drink to buy.
                    </p>

                    <div className="flex justify-center gap-3">
                        <button
                            onClick={openVenmo}
                            className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-xs font-medium text-gray-600 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer shadow-sm"
                        >
                            <VenmoIcon />
                            Venmo
                        </button>
                        <button
                            onClick={openPayPal}
                            className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-xs font-medium text-gray-600 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer shadow-sm"
                        >
                            <PayPalIcon />
                            PayPal
                        </button>
                    </div>
                </div>
            </div>

            <p className="mt-6 text-center text-[11px] text-gray-400 leading-relaxed max-w-md mx-auto">
                Results are estimates only — always verify earnings with <a href="https://www.alaskaair.com/content/mileage-plan" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">alaskaair.com</a> before making travel decisions.
                This is an independent, unofficial tool not affiliated with, endorsed by, or sponsored by Atmos Rewards, Alaska Airlines, or Hawaiian Airlines.
                Program details are based on publicly available information and may not reflect the most current terms.
            </p>
        </>
    );
}
