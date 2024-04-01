#include <boost/beast/core.hpp>
#include <boost/beast/websocket.hpp>
#include <boost/asio/ip/tcp.hpp>
#include <cstdlib>
#include <iostream>
#include <string>
#include <thread>
#include <vector>
#include <mutex>

namespace beast = boost::beast;
namespace websocket = beast::websocket;
namespace net = boost::asio;
using tcp = boost::asio::ip::tcp;

std::vector<websocket::stream<tcp::socket>> clients;
std::mutex clientsMutex;

void broadcast_message(const std::string& message) {
    std::lock_guard<std::mutex> guard(clientsMutex);
    for (auto& ws : clients) {
        ws.write(net::buffer(message));
    }
}


void do_session(tcp::socket socket) {
    try {
        websocket::stream<tcp::socket> ws{std::move(socket)};
        
        std::cout << "Attempting WebSocket handshake..." << std::endl;
        ws.accept();
        std::cout << "WebSocket handshake successful." << std::endl;

        {
            std::lock_guard<std::mutex> guard(clientsMutex);
            clients.push_back(std::move(ws));
        }

        for(;;) {
            beast::flat_buffer buffer;
            clients.back().read(buffer);
            std::string message = beast::buffers_to_string(buffer.data());

            std::cout << "Message received: " << message << std::endl;
            broadcast_message(message);
        }
    } catch(beast::system_error const& se) {
        if(se.code() != websocket::error::closed)
            std::cerr << "WebSocket error: " << se.code().message() << std::endl;
        else
            std::cout << "WebSocket connection closed." << std::endl;
    } catch(std::exception const& e) {
        std::cerr << "Error: " << e.what() << std::endl;
    }
}

int main(int argc, char* argv[]) {
    try {
        auto const address = net::ip::make_address("127.0.0.1");
        auto const port = static_cast<unsigned short>(std::atoi("8080"));

        net::io_context ioc{1};
        tcp::acceptor acceptor{ioc, {address, port}};
        std::cout << "Server listening on ws://127.0.0.1:8080" << std::endl;

        for(;;) {
            tcp::socket socket{ioc};
            acceptor.accept(socket);
            std::cout << "New TCP connection accepted." << std::endl;

            std::thread(&do_session, std::move(socket)).detach();
        }
    } catch (const std::exception& e) {
        std::cerr << "Exception: " << e.what() << "\n";
    }

    return 0;
}
