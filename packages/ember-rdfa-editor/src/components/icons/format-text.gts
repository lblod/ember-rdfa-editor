import type { TOC } from '@ember/component/template-only';

type Signature = {
  Element: SVGElement;
};

const FormatTextIcon: TOC<Signature> = <template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    ...attributes
  >
    <rect width="24" height="24" fill="transparent" />
    <g clip-path="url(#clip0_261_637)">
      <path
        d="M15.3239 13.0038L12.2213 4H10.3718L6.7703 14.5004C6.41745 14.5491 6.08894 14.6099 5.82126 14.6707C5.77259 14.7559 5.73608 14.9506 5.73608 15.1331C5.73608 15.3643 5.78475 15.6076 5.84559 15.6806C5.90643 15.7171 6.46612 15.7536 6.97715 15.7536H8.01137C8.5224 15.7536 9.08209 15.7171 9.14293 15.6806C9.20376 15.6076 9.25243 15.3643 9.25243 15.1331C9.25243 14.9506 9.2281 14.7559 9.16726 14.6707C8.89958 14.6099 8.54673 14.549 8.18171 14.4882L8.69274 13.0038H15.2996H15.3239ZM9.1551 11.7262L11.3087 5.48441L13.4623 11.7262"
      />
      <path
        d="M17.6357 15.851V13.235H16.1027V14.5369V15.7293V15.851H13.4867V17.384H16.1027V20H17.6357V17.384H20.2517V15.851H17.6357Z"
      />
    </g>
    <defs>
      <clipPath id="clip0_261_637">
        <rect width="14.5034" height="16" transform="translate(5.74829 4)" />
      </clipPath>
    </defs>
  </svg>
</template>;

export default FormatTextIcon;
