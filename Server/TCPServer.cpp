#include <boost/beast/core.hpp>
#include <boost/beast/websocket.hpp>
#include <boost/asio/ip/tcp.hpp>
#include <cstdlib>
#include <iostream>
#include <string>
#include <thread>
#include <vector>
#include <mutex>
#include <memory> // For std::shared_ptr and std::make_shared

namespace beast = boost::beast;
namespace websocket = beast::websocket;
namespace net = boost::asio;
using tcp = boost::asio::ip::tcp;

// Change the type of clients to store std::shared_ptr to WebSocket streams
std::vector<std::shared_ptr<websocket::stream<tcp::socket>>> clients;
std::mutex clientsMutex;

void broadcast_message(const std::string& message) {
    std::lock_guard<std::mutex> guard(clientsMutex);
    for (auto& ws : clients) {
        if (ws->is_open()) { // Check if the WebSocket is still open
            ws->write(net::buffer(message));
        }
    }
    // Remove closed WebSocket connections
    clients.erase(std::remove_if(clients.begin(), clients.end(), 
        [](const auto& ws) { return !ws->is_open(); }), clients.end());
}

void do_session(tcp::socket socket) {
    try {
        auto ws = std::make_shared<websocket::stream<tcp::socket>>(std::move(socket)); // Use shared_ptr
        
        std::cout << "Attempting WebSocket handshake..." << std::endl;
        ws->accept();
        std::cout << "WebSocket handshake successful." << std::endl;

        {
            std::lock_guard<std::mutex> guard(clientsMutex);
            clients.push_back(ws); // No need to std::move
        }

        for(;;) {
            beast::flat_buffer buffer;
            ws->read(buffer); // Use the shared_ptr directly
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
    // No need to manually remove the WebSocket from the clients vector; it's handled in broadcast_message
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
