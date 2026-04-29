import { useEffect, useRef } from "react";

export function GoogleAddressInput({
    value,
    onChange,
    onSelect,
}: {
    value: string;
    onChange: (val: string) => void;
    onSelect: (data: {
        address: string;
        lat: number;
        lng: number;
    }) => void;
}) {
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (!window.google || !inputRef.current) return;

        const autocomplete = new window.google.maps.places.Autocomplete(
            inputRef.current,
            { types: ["geocode"] }
        );

        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();

            if (!place.geometry) return;

            onSelect({
                address: place.formatted_address || "",
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
            });
        });
    }, []);

    return (
        <input
            ref={inputRef}
            className="input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search address..."
        />
    );
}