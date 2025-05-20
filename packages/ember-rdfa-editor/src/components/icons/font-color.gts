<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    {{! @glint-expect-error: not typesafe yet }}
    ...attributes
  >
    <rect width="24" height="24" fill="none" />
    <g clip-path="url(#clip0_261_638)">
      <path
        d="M10.3692 4H13.6478L19.1633 20H16.1921L15.0651 16.7385H8.95195L7.82494 20H4.85376L10.3692 4ZM14.143 14.0406L12.0085 7.84205L9.87404 14.0406H14.143Z"
        fill="black"
      />
    </g>
    <defs>
      <clipPath id="clip0_261_638">
        <rect
          width="14.2924"
          height="16"
          fill="white"
          transform="translate(4.85376 4)"
        />
      </clipPath>
    </defs>
  </svg>
</template>
