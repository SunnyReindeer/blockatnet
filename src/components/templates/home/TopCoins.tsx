import React, { useState, useEffect } from 'react';

const TradingViewWidget = ({ symbol }) => {
    useEffect(() => {
        // Ensure the widget container is cleared
        const widgetContainer = document.getElementById('tradingview-widget-container');
        widgetContainer.innerHTML = '';

        // Load the TradingView widget dynamically
        new window.TradingView.widget({
            // TradingView Widget configuration
            // You'll need to adjust these options according to your needs
            // and what's provided by the TradingView widget documentation
            container_id: 'tradingview-widget-container',
            autosize: true,
            symbol: `${symbol}`, // Dynamically set the symbol
            interval: 'D',
            timezone: 'Etc/UTC',
            theme: 'light',
            style: '1',
            locale: 'en',
            toolbar_bg: '#f1f3f6',
            enable_publishing: false,
            withdateranges: true,
            hide_side_toolbar: false,
            allow_symbol_change: true,
            details: true,
            hotlist: true,
            calendar: true,
            news: [
                'headlines'
            ],
            studies: [
                'MACD@tv-basicstudies'
            ],
            show_popup_button: true,
            popup_width: '1000',
            popup_height: '650',
        });
    }, [symbol]); // Re-run this effect when the symbol changes

    return <div id="tradingview-widget-container" />;
};

const TopCoins = () => {
    const [selectedSymbol, setSelectedSymbol] = useState('');

    const handleCoinClick = (symbol) => {
        setSelectedSymbol(symbol);
    };

    // Assuming `tokens` is your list of top 5 coins
    return (
        <div>
            {selectedSymbol && <TradingViewWidget symbol={selectedSymbol} />}
        </div>
    );
};

export default TopCoins;
