import {
  Body,
  Button,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
  Tailwind,
} from '@react-email/components';
import { render } from '@react-email/render';
import * as React from 'react';

export interface Props {
  title: string;
  subTitle: string;
  recipientName?: string;
  paragraphs: string[];
}

const logo =
  'https://num.technanimals.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.c5e12614.png&w=640&q=75';

// TODO: Replace this with the correct URL
const baseUrl = 'https://num.technanimals.com';

const links = {
  'Privacy Policy': `${baseUrl}/private-policy`,
  Terms: `${baseUrl}/terms`,
  'Forgot Password?': `${baseUrl}/forgot-password`,
};

const info = {
  address: '123 Main street, Cityville, State 56789',
  phone: '(+27) 123-4567',
  email: 'info@repo.com',
  website: 'www.num.com',
};

function EmailTemplate({ title, subTitle, recipientName, paragraphs }: Props) {
  return (
    <Html>
      <Head />
      <Preview>
        {title} {subTitle}
      </Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                primary: '#e11f26',
              },
              lineHeight: {
                DEFAULT: '1',
              },
            },
          },
        }}
      >
        <Body className="leading-none bg-gray-100 my-auto mx-auto font-sans px-2 ">
          <Container className="border border-solid border-[#eaeaea] rounded  mx-auto w-full pb-6">
            <Hr className="border-2 border-solid border-primary mb-[26px] mx-0 w-full" />
            <Section className="mt-[22px] items-center mx-auto">
              <Row align="center" className="justify-center mx-auto">
                <Column align="center">
                  <Img
                    src={logo}
                    width="70"
                    height="70"
                    alt="National union of mine workers"
                    className="my-0 mx-auto"
                  />
                </Column>
                <Column>
                  <Text className="font-bold text-lg">
                    National union <br /> of Mine workers
                  </Text>
                </Column>
              </Row>
            </Section>
            <Section className="my-[32px] bg-primary pb-[32px]">
              <Heading className="text-white text-[24px] leading-none font-extrabold text-center p-0 mx-0">
                {title}
                {subTitle ? ':' : ''}
              </Heading>
              <Heading className="text-white text-[20px] leading-none font-normal text-center p-0 mx-0">
                {subTitle}
              </Heading>
            </Section>
            <Container className="rounded self-center justify-center items-center -mt-[60px] pt-[20px] w-10/12 bg-white shadow-lg">
              {recipientName && (
                <Text className="text-black text-center text-[12px] leading-normal">
                  Dear {recipientName},
                </Text>
              )}
              {paragraphs.map((text, i) => (
                <Text
                  dangerouslySetInnerHTML={{ __html: text }}
                  key={i}
                  className="text-black text-center text-[12px] leading-normal"
                />
              ))}
              <Text className="text-black text-center text-[12px] leading-normal">
                Best Regards <br /> NUM Team
              </Text>
              <Container className="bg-gray-200 rounded-b w-full py-[20px] m-0">
                <Row className="mb-4">
                  <Column align="center">
                    <Img
                      src={logo}
                      width="35"
                      height="35"
                      alt="National union of mine workers"
                      className="my-0 mx-auto"
                    />
                  </Column>
                </Row>
                <Row className="pb-2 w-full">
                  <Text className="text-[#666666] text-[10px] text-center">
                    {Object.keys(links).map((key) => (
                      <Link
                        href={links[key as keyof typeof links]}
                        className="leading-none mx-4 no-underline text-[#666666] text-[10px] text-center"
                      >
                        {key}
                      </Link>
                    ))}
                  </Text>
                </Row>

                <Row>
                  <Text className="text-[#666666] text-[10px] text-center">
                    National Union of Mine Workers
                    <br />
                    {info.address}
                    <br />
                    Phone: {info.phone} | Email:{' '}
                    <Link href={`mailto:${info.email}`}>{info.email}</Link> | Website:{' '}
                    <Link href={info.website}>{info.website}</Link>
                  </Text>
                </Row>
              </Container>
            </Container>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export function renderEmail(props: Props) {
  return render(<EmailTemplate {...props} />);
}

EmailTemplate.PreviewProps = {
  title: 'Case Postponement:',
  subTitle: `Case #123`,
} as Props;
